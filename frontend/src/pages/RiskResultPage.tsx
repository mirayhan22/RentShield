import type { RiskResultPageProps } from "../utils/types";
import FormSection from "../components/ui/FormSection";
import ArrowButton from "../components/ui/ArrowButton";

/**
 * Risk Result screen: displays risk level badge, headline,
 * and list of triggered signals with explanations and actions.
 * Uses: FormSection, ArrowButton
 */
export default function RiskResultPage({
  riskResult,
  onContinue,
}: RiskResultPageProps) {
  const levelConfig = {
    low: {
      bg: "bg-[#2A9D8F]/10",
      border: "border-[#2A9D8F]",
      text: "text-[#1B7A6B]",
      label: "Low Concern",
      ariaLabel: "Risk level: Low concern",
      icon: "✓",
    },
    review: {
      bg: "bg-[#E9C46A]/10",
      border: "border-[#E9C46A]",
      text: "text-[#92400E]",
      label: "Review Before Paying",
      ariaLabel: "Risk level: Review recommended before paying",
      icon: "⚠",
    },
    high: {
      bg: "bg-[#E76F51]/10",
      border: "border-[#E76F51]",
      text: "text-[#C44A30]",
      label: "High Concern",
      ariaLabel: "Risk level: High concern — pause and verify",
      icon: "✕",
    },
  };

  const config = levelConfig[riskResult.level];

  return (
    <div className="flex flex-col gap-6">
      <FormSection
        eyebrow="Step 4 of 5"
        title="Your risk result"
        description="Based on the information you provided, here is the safety assessment for this rental."
      >
        {/* Risk level badge */}
        <div
          className={`rounded-xl border-2 ${config.border} ${config.bg} flex flex-col items-center gap-2 p-6 text-center`}
          role="status"
          aria-label={config.ariaLabel}
        >
          <span className={`text-3xl ${config.text}`} aria-hidden="true">
            {config.icon}
          </span>
          <span className={`text-lg font-bold ${config.text}`}>
            {config.label}
          </span>
          <p className="text-sm leading-relaxed text-[#1B2A4A]">
            {riskResult.headline}
          </p>
        </div>
      </FormSection>

      {/* Signals list */}
      {riskResult.signals.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[#1B2A4A]">
            Concerns identified ({riskResult.signals.length})
          </h3>
          {riskResult.signals.map((signal, index) => (
            <div
              key={index}
              className="rounded-lg border border-[#E5E7EB] bg-white p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    signal.concern === "high" ? "bg-[#E76F51]" : "bg-[#E9C46A]"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-sm font-semibold text-[#1B2A4A]">
                  {signal.label}
                </span>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    signal.concern === "high"
                      ? "bg-[#E76F51]/10 text-[#C44A30]"
                      : "bg-[#E9C46A]/10 text-[#92400E]"
                  }`}
                >
                  {signal.concern === "high" ? "high concern" : "review concern"}
                </span>
              </div>
              <p className="mb-2 text-xs leading-relaxed text-[#6B7280]">
                {signal.explanation}
              </p>
              <div className="rounded-md border-l-4 border-[#2A9D8F] bg-[#F8F9FA] p-3">
                <p className="text-xs font-medium text-[#1B7A6B]">
                  ✓ What to do:
                </p>
                <p className="text-xs leading-relaxed text-[#1B2A4A]">
                  {signal.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No signals */}
      {riskResult.signals.length === 0 && (
        <div className="rounded-lg border border-[#2A9D8F]/30 bg-[#2A9D8F]/5 p-4 text-center">
          <p className="text-sm text-[#1B2A4A]">
            No major warning signs were identified based on your answers.
            Continue with standard due diligence.
          </p>
        </div>
      )}

      {/* How this result is calculated */}
      <div className="rounded-lg border border-[#D1D5DB] bg-[#F8F9FA] p-4">
        <h3 className="mb-2 text-sm font-semibold text-[#1B2A4A]">
          How this result is calculated
        </h3>
        <ul className="flex list-disc flex-col gap-1.5 pl-4 text-xs leading-relaxed text-[#6B7280]">
          <li>
            The result is based entirely on the answers you provided on the
            Rental Details and Quick Check screens.
          </li>
          <li>
            Warning signs are checked against fixed rules: payment requested
            before viewing, property not viewed in person, unregulated listing
            source, unusually low rent (under $150/week), pressure to pay
            quickly, and no written agreement.
          </li>
          <li>
            Each sign is rated as either a <strong>high concern</strong> or a{" "}
            <strong>review concern</strong>.
          </li>
          <li>
            The overall level is determined by simple thresholds: two or more
            high-concern signs produce a <em>High</em> result; one high-concern
            sign or two to three total signs produce a <em>Review</em> result;
            zero or one total sign produces a <em>Low</em> result.
          </li>
          <li>
            This screening is a general guide only. It is not proof of fraud,
            does not constitute legal advice, and should not replace your own
            due diligence or professional guidance.
          </li>
        </ul>
      </div>

      <ArrowButton variant="secondary" onClick={onContinue}>
        Continue to verification plan
      </ArrowButton>

      <p className="text-center text-[10px] text-[#9CA3AF]">
        This is a student prototype. It does not provide legal advice.
      </p>
    </div>
  );
}