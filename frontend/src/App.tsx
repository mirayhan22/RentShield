import { useState, useCallback } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import type {
  RentalDetails,
  QuickCheckAnswers,
  RiskResult,
  VerificationAction,
  RiskCheckRecord,
  SaveStatus,
} from "./utils/types";
import { calculateRisk, generateVerificationActions } from "./utils/riskCalculator";
import { riskCheckApi, ApiError } from "./utils/api";
import type { RiskCheckPayload } from "./utils/api";
import { clearSession, getSession, isDemoSession } from "./utils/auth";
import LoginPage from "./pages/LoginPage";
import RentalDetailsPage from "./pages/RentalDetailsPage";
import QuickCheckPage from "./pages/QuickCheckPage";
import RiskResultPage from "./pages/RiskResultPage";
import VerificationPlanPage from "./pages/VerificationPlanPage";
import ConfirmationPage from "./pages/ConfirmationPage";

/** Default empty rental details */
const emptyRentalDetails: RentalDetails = {
  suburb: "",
  weeklyRent: "",
  listingSource: "",
  viewedInPerson: null,
  paymentBeforeViewing: null,
};

/** Default empty quick check answers */
const emptyQuickCheckAnswers: QuickCheckAnswers = {
  pressuredToPay: null,
  noWrittenAgreement: null,
  unregulatedSource: null,
  unusuallyLowRent: null,
};

/**
 * AppContent wraps all routes and owns shared application state.
 * Demonstrates props-down and callbacks-up pattern:
 *   - Each page receives its data slice as props
 *   - Each page calls onComplete() to send data back
 *   - App merges data and navigates to the next route
 *
 * Authentication:
 *   - LoginPage signs up / signs in via the backend and stores the session
 *   - All application routes are protected and require a session
 *   - Completed checks are saved with POST /api/risk-checks (Bearer token)
 *   - Saved records are retrieved with GET /api/risk-checks
 */
function AppContent() {
  const [session, setSession] = useState(() => getSession());
  const [rentalDetails, setRentalDetails] = useState<RentalDetails>(emptyRentalDetails);
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<QuickCheckAnswers>(emptyQuickCheckAnswers);
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [verificationActions, setVerificationActions] = useState<VerificationAction[]>([]);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedChecks, setSavedChecks] = useState<RiskCheckRecord[]>([]);

  const navigate = useNavigate();

  const isAuthenticated = session !== null;
  const userEmail = session?.email ?? "";

  /** Wrap an element so only signed-in users can access it. */
  const requireAuth = useCallback(
    (node: ReactNode) => (isAuthenticated ? node : <Navigate to="/" replace />),
    [isAuthenticated]
  );

  // Login handler — the session has already been stored by LoginPage
  const handleLoginComplete = useCallback(() => {
    setSession(getSession());
    navigate("/rental-details");
  }, [navigate]);

  // Rental Details handler
  const handleRentalDetailsComplete = useCallback(
    (data: RentalDetails) => {
      setRentalDetails(data);
      navigate("/quick-check");
    },
    [navigate]
  );

  // Quick Check handler — calculate risk after BOTH forms are complete
  const handleQuickCheckComplete = useCallback(
    (data: QuickCheckAnswers) => {
      setQuickCheckAnswers(data);
      // Calculate risk using data from both forms
      const result = calculateRisk(rentalDetails, data);
      setRiskResult(result);
      // Generate verification actions based on risk level
      const actions = generateVerificationActions(result);
      setVerificationActions(actions);
      navigate("/risk-result");
    },
    [navigate, rentalDetails]
  );

  // Risk Result handler
  const handleRiskResultContinue = useCallback(() => {
    navigate("/verification-plan");
  }, [navigate]);

  /** Save the completed risk check to the backend and refresh saved records. */
  const saveRiskCheck = useCallback(
    async (actions: VerificationAction[], note: string) => {
      if (!riskResult) return;

      if (isDemoSession()) {
        setSaveStatus("demo");
        setSaveMessage(
          "Demo mode: this check is not saved to an account. Create an account to save your checks."
        );
        return;
      }

      setSaveStatus("saving");
      setSaveMessage("Saving your safety check to your account...");

      const payload: RiskCheckPayload = {
        suburb: rentalDetails.suburb,
        weekly_rent: rentalDetails.weeklyRent,
        listing_source: rentalDetails.listingSource,
        viewed_in_person: rentalDetails.viewedInPerson ?? false,
        payment_before_viewing: rentalDetails.paymentBeforeViewing ?? false,
        pressured_to_pay: quickCheckAnswers.pressuredToPay ?? false,
        no_written_agreement: quickCheckAnswers.noWrittenAgreement ?? false,
        unregulated_source: quickCheckAnswers.unregulatedSource ?? false,
        unusually_low_rent: quickCheckAnswers.unusuallyLowRent ?? false,
        risk_level: riskResult.level,
        risk_signals: {
          level: riskResult.level,
          headline: riskResult.headline,
          signals: riskResult.signals,
        },
        verification_actions: actions,
        evidence_note: note,
      };

      try {
        await riskCheckApi.create(payload);
        setSaveStatus("saved");
        setSaveMessage("Your safety check has been saved to your account.");
        // Retrieve all saved records for this account
        try {
          const records = await riskCheckApi.list();
          setSavedChecks(records);
        } catch {
          // Keep the save success even if the history cannot be loaded.
        }
      } catch (err) {
        setSaveStatus("error");
        setSaveMessage(
          err instanceof ApiError
            ? `Your safety check was not saved: ${err.message}`
            : "Your safety check was not saved. Please check your connection and try again."
        );
      }
    },
    [riskResult, rentalDetails, quickCheckAnswers]
  );

  // Verification Plan handler — this completes the workflow, so save it
  const handleVerificationPlanComplete = useCallback(
    (actions: VerificationAction[], note: string) => {
      setVerificationActions(actions);
      setEvidenceNote(note);
      setSaveStatus("saving");
      setSaveMessage("Saving your safety check to your account...");
      navigate("/confirmation");
      void saveRiskCheck(actions, note);
    },
    [navigate, saveRiskCheck]
  );

  // Retry saving after a failure
  const handleRetrySave = useCallback(() => {
    void saveRiskCheck(verificationActions, evidenceNote);
  }, [saveRiskCheck, verificationActions, evidenceNote]);

  // Reset all state for a new check (also signs the user out)
  const handleStartNew = useCallback(() => {
    clearSession();
    setSession(null);
    setRentalDetails(emptyRentalDetails);
    setQuickCheckAnswers(emptyQuickCheckAnswers);
    setRiskResult(null);
    setVerificationActions([]);
    setEvidenceNote("");
    setSaveStatus("idle");
    setSaveMessage("");
    setSavedChecks([]);
    navigate("/");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-[#1B2A4A]">RentShield</h1>
          {isAuthenticated && (
            <span className="min-w-0 truncate text-xs text-[#6B7280]">
              {userEmail}
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Routes>
          <Route
            path="/"
            element={<LoginPage onComplete={handleLoginComplete} />}
          />
          <Route
            path="/rental-details"
            element={requireAuth(
              <RentalDetailsPage
                initialData={rentalDetails}
                onComplete={handleRentalDetailsComplete}
              />
            )}
          />
          <Route
            path="/quick-check"
            element={requireAuth(
              <QuickCheckPage
                initialData={quickCheckAnswers}
                onComplete={handleQuickCheckComplete}
              />
            )}
          />
          <Route
            path="/risk-result"
            element={requireAuth(
              riskResult ? (
                <RiskResultPage
                  riskResult={riskResult}
                  onContinue={handleRiskResultContinue}
                />
              ) : (
                <p>No risk result available. Please start from the beginning.</p>
              )
            )}
          />
          <Route
            path="/verification-plan"
            element={requireAuth(
              <VerificationPlanPage
                actions={verificationActions}
                evidenceNote={evidenceNote}
                onComplete={handleVerificationPlanComplete}
              />
            )}
          />
          <Route
            path="/confirmation"
            element={requireAuth(
              riskResult ? (
                <ConfirmationPage
                  riskResult={riskResult}
                  verificationActions={verificationActions}
                  rentalDetails={rentalDetails}
                  onStartNew={handleStartNew}
                  saveStatus={saveStatus}
                  saveMessage={saveMessage}
                  savedChecks={savedChecks}
                  onRetrySave={handleRetrySave}
                />
              ) : (
                <p>No data available. Please start from the beginning.</p>
              )
            )}
          />
        </Routes>
      </main>

      {/* Prototype disclaimer */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <p className="text-center text-[10px] leading-relaxed text-[#9CA3AF]">
            RentShield is a student prototype for BUS4012. It does not provide
            legal advice, authenticate landlords, or guarantee listing accuracy.
            Always verify independently before paying.
          </p>
        </div>
      </footer>
    </div>
  );
}

/**
 * App is the root component. It wraps AppContent in BrowserRouter
 * so useNavigate() works inside AppContent.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}