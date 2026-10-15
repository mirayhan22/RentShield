import type { ConfirmationPageProps } from "../utils/types";
import PrimaryButton from "../components/ui/PrimaryButton";
import PrivacyNotice from "../components/ui/PrivacyNotice";

/**
 * Confirmation screen: clearly distinguishes successful completion
 * from needs-follow-up state.
 * Uses: PrimaryButton, ArrowButton (via "Start New Check")
 */
export default function ConfirmationPage({
  riskResult,
  verificationActions,
  rentalDetails,
  onStartNew,
  saveStatus,
  saveMessage,
  savedChecks,
  onRetrySave,
}: ConfirmationPageProps) {
  const essentialActions = verificationActions.filter((a) => a.isEssential);
  const completedEssential = essentialActions.filter((a) => a.completed);
  const incompleteEssential = essentialActions.filter((a) => !a.completed);
  const isComplete = incompleteEssential.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Save status for this check */}
      {saveStatus !== "idle" && (
        <div
          role="status"
          className={`rounded-lg border p-4 text-sm ${
            saveStatus === "saved"
              ? "border-[#2A9D8F]/40 bg-[#2A9D8F]/5 text-[#2A9D8F]"
              : saveStatus === "error"
                ? "border-[#E76F51]/40 bg-[#E76F51]/5 text-[#E76F51]"
                : saveStatus === "demo"
                  ? "border-[#E9C46A]/40 bg-[#E9C46A]/5 text-[#92400E]"
                  : "border-[#E5E7EB] bg-white text-[#6B7280]"
          }`}
        >
          <p className="font-semibold">
            {saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
                ? "Saved to your account"
                : saveStatus === "error"
                  ? "Not saved"
                  : "Demo mode"}
          </p>
          {saveMessage && <p className="mt-1">{saveMessage}</p>}
          {saveStatus === "error" && (
            <div className="mt-3">
              <PrimaryButton variant="secondary" onClick={onRetrySave}>
                Try Again
              </PrimaryButton>
            </div>
          )}
        </div>
      )}

      {/* Success state */}
      {isComplete && (
        <>
          <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-[#2A9D8F] bg-[#2A9D8F]/5 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2A9D8F]">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              Safety Check Complete
            </h2>
            <p className="text-sm leading-relaxed text-[#6B7280]">
              You have taken important steps to verify this rental before
              committing. Keep your evidence note and any correspondence saved.
            </p>
          </div>
        </>
      )}

      {/* Needs follow-up state */}
      {!isComplete && (
        <>
          <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-[#E9C46A] bg-[#E9C46A]/5 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E9C46A]">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M12 3l9.09 16.5H2.91L12 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1B2A4A]">
              Follow-Up Needed
            </h2>
            <p className="text-sm leading-relaxed text-[#6B7280]">
              You have not completed all essential verification actions. We
              strongly recommend completing these before making any payment.
            </p>
          </div>

          {/* Incomplete actions list */}
          <div className="rounded-lg border border-[#E9C46A]/30 bg-[#E9C46A]/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#1B2A4A]">
              Incomplete essential actions:
            </h3>
            <ul className="flex flex-col gap-2">
              {incompleteEssential.map((action) => (
                <li
                  key={action.id}
                  className="flex items-start gap-2 text-sm text-[#E76F51]"
                >
                  <span className="mt-0.5" aria-hidden="true">
                    ✕
                  </span>
                  <span>{action.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Summary */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-[#1B2A4A]">
          Summary
        </h3>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <dt className="text-[#6B7280]">Suburb</dt>
          <dd className="font-medium text-[#1B2A4A]">
            {rentalDetails.suburb || "—"}
          </dd>
          <dt className="text-[#6B7280]">Weekly rent</dt>
          <dd className="font-medium text-[#1B2A4A]">
            ${rentalDetails.weeklyRent}/week
          </dd>
          <dt className="text-[#6B7280]">Risk level</dt>
          <dd>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                riskResult.level === "low"
                  ? "bg-[#2A9D8F]/10 text-[#2A9D8F]"
                  : riskResult.level === "review"
                    ? "bg-[#E9C46A]/10 text-[#92400E]"
                    : "bg-[#E76F51]/10 text-[#E76F51]"
              }`}
            >
              {riskResult.level === "low"
                ? "Low"
                : riskResult.level === "review"
                  ? "Review"
                  : "High"}
            </span>
          </dd>
          <dt className="text-[#6B7280]">Actions done</dt>
          <dd className="font-medium text-[#1B2A4A]">
            {completedEssential.length} of {essentialActions.length} essential
          </dd>
        </dl>
      </div>

      {/* Saved checks retrieved from the account */}
      {savedChecks.length > 0 && (
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#1B2A4A]">
            Saved checks
          </h3>
          <ul className="flex flex-col gap-2">
            {savedChecks.map((check) => (
              <li
                key={check.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[#E5E7EB] p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1B2A4A]">
                    {check.suburb} — ${check.weekly_rent}/week
                  </p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {check.listing_source}
                    {check.created_at
                      ? ` · ${new Date(check.created_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`inline-block flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    check.risk_level === "low"
                      ? "bg-[#2A9D8F]/10 text-[#2A9D8F]"
                      : check.risk_level === "review"
                        ? "bg-[#E9C46A]/10 text-[#92400E]"
                        : "bg-[#E76F51]/10 text-[#E76F51]"
                  }`}
                >
                  {check.risk_level === "low"
                    ? "Low"
                    : check.risk_level === "review"
                      ? "Review"
                      : "High"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <PrivacyNotice>
        Your saved safety checks are associated with your account and stored
        securely so you can review your history. They include the details and
        answers you entered during the check.
      </PrivacyNotice>

      {/* Start New Check button */}
      <PrimaryButton variant="secondary" onClick={onStartNew}>
        Start New Check
      </PrimaryButton>
    </div>
  );
}