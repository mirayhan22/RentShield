import type {
  RentalDetails,
  QuickCheckAnswers,
  RiskResult,
  RiskSignal,
  VerificationAction,
} from "./types";

/**
 * Transparent, rule-based risk calculator.
 *
 * Rules (highest applicable level wins):
 *   - 2+ high signals         → High concern
 *   - 1 high signal           → Review recommended
 *   - 2–3 total signals       → Review recommended
 *   - 0–1 total signals       → Low concern
 *
 * Every signal includes an explanation AND a recommended verification action.
 */
export function calculateRisk(
  rental: RentalDetails,
  answers: QuickCheckAnswers
): RiskResult {
  const signals: RiskSignal[] = [];

  // --- Rental Details signals ---

  if (rental.paymentBeforeViewing === true) {
    signals.push({
      label: "Payment requested before viewing",
      concern: "high",
      explanation:
        "Scammers often demand money before you see the property. A legitimate landlord will allow you to inspect first.",
      action:
        "Never pay a bond or rent before an in-person inspection. Ask to meet at the property and confirm it matches the listing.",
    });
  }

  if (rental.viewedInPerson === false) {
    signals.push({
      label: "Property not viewed in person",
      concern: "review",
      explanation:
        "You cannot confirm the property exists or matches the listing photos without visiting in person.",
      action:
        "Arrange a physical inspection before committing. If you are interstate, ask a trusted friend or use a video call walkthrough.",
    });
  }

  const unregulatedSources = ["Facebook Marketplace", "Gumtree", "WeChat", "Other"];
  if (unregulatedSources.includes(rental.listingSource)) {
    signals.push({
      label: "Listing from an unregulated source",
      concern: "review",
      explanation:
        "Unverified platforms have weaker fraud protections compared to regulated real estate sites.",
      action:
        "Prefer regulated platforms like Domain or realestate.com.au, or verify through a licensed real estate agent.",
    });
  }

  // Weekly rent threshold — below this amount is unusually low for a room in Victoria.
  // Based on typical shared-room listings; Domain/REA median data can be used to verify.
  const LOW_RENT_THRESHOLD = 150;
  const rentNum = parseFloat(rental.weeklyRent);
  if (!isNaN(rentNum) && rentNum > 0 && rentNum < LOW_RENT_THRESHOLD) {
    signals.push({
      label: "Unusually low rent",
      concern: "review",
      explanation:
        "Extremely low prices can be bait used by scammers to attract victims quickly.",
      action:
        "Compare with median rent for the suburb on Domain or realestate.com.au. If the price is far below market, proceed with caution.",
    });
  }

  // --- Quick Check signals ---

  if (answers.pressuredToPay === true) {
    signals.push({
      label: "Pressure to pay quickly",
      concern: "high",
      explanation:
        "Pressure tactics — such as claiming others are interested or setting tight deadlines — are a common scam indicator.",
      action:
        "Take your time. Legitimate landlords allow due diligence. Walk away if you feel rushed.",
    });
  }

  if (answers.noWrittenAgreement === true) {
    signals.push({
      label: "No written agreement",
      concern: "high",
      explanation:
        "Without a written lease or rooming agreement you have no legal protection if something goes wrong.",
      action:
        "Always get a written lease or rooming agreement. In Victoria, use the standard Residential Tenancy Agreement from Consumer Affairs Victoria.",
    });
  }

  if (answers.unregulatedSource === true) {
    // Only add if not already flagged from rental details
    const alreadyFlagged = signals.some(
      (s) => s.label === "Listing from an unregulated source"
    );
    if (!alreadyFlagged) {
      signals.push({
        label: "Listing from an unregulated source",
        concern: "review",
        explanation:
          "Unverified platforms have weaker fraud protections compared to regulated real estate sites.",
        action:
          "Prefer regulated platforms like Domain or realestate.com.au, or verify through a licensed real estate agent.",
      });
    }
  }

  if (answers.unusuallyLowRent === true) {
    const alreadyFlagged = signals.some((s) => s.label === "Unusually low rent");
    if (!alreadyFlagged) {
      signals.push({
        label: "Unusually low rent",
        concern: "review",
        explanation:
          "Extremely low prices can be bait used by scammers to attract victims quickly.",
        action:
          "Compare with median rent for the suburb on Domain or realestate.com.au. If the price is far below market, proceed with caution.",
      });
    }
  }

  // --- Determine risk level ---
  // Threshold rules (highest applicable level wins):
  //   Rule 1: 2+ high signals              → High concern
  //   Rule 2: 1 high signal OR 2–3 total   → Review recommended
  //   Rule 3: 0–1 total signals            → Low concern
  const highCount = signals.filter((s) => s.concern === "high").length;
  const totalCount = signals.length;

  let level: RiskResult["level"];
  let headline: string;

  // Rule 1: two or more high-severity signals
  if (highCount >= 2) {
    level = "high";
    headline =
      "High concern — strongly recommend pausing this rental until you can verify the details.";
  }
  // Rule 2: one high signal, or two to three total signals (any mix)
  else if (highCount >= 1 || totalCount >= 2) {
    level = "review";
    headline =
      "Review recommended — pause and verify the flagged items before making any payment.";
  }
  // Rule 3: zero or one total signal
  else {
    level = "low";
    headline =
      "Low concern — standard caution advised. Continue with normal due diligence.";
  }

  return { level, headline, signals };
}

/**
 * Generate verification actions based on the risk result.
 * Essential actions are always included; additional actions are added for higher risk levels.
 */
export function generateVerificationActions(
  riskResult: RiskResult
): VerificationAction[] {
  const actions: VerificationAction[] = [
    {
      id: "inspect",
      label: "Inspect the property in person before paying anything",
      completed: false,
      isEssential: true,
    },
    {
      id: "written-agreement",
      label: "Request a written lease or rooming agreement",
      completed: false,
      isEssential: true,
    },
  ];

  if (riskResult.level === "review" || riskResult.level === "high") {
    actions.push({
      id: "verify-landlord",
      label:
        "Verify the landlord or agent identity (e.g. check RTBA, ask for proof of ownership)",
      completed: false,
      isEssential: riskResult.level === "high",
    });
    actions.push({
      id: "check-rent",
      label:
        "Compare the asking rent with median rent for the suburb on Domain or realestate.com.au",
      completed: false,
      isEssential: false,
    });
  }

  if (riskResult.level === "high") {
    actions.push({
      id: "tenant-union",
      label:
        "Contact your local tenant union or student accommodation service for advice",
      completed: false,
      isEssential: true,
    });
    actions.push({
      id: "save-evidence",
      label: "Save all messages, screenshots, and correspondence as evidence",
      completed: false,
      isEssential: true,
    });
  }

  return actions;
}