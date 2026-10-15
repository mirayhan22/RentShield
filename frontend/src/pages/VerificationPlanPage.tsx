import { useState } from "react";
import type {
  VerificationPlanPageProps,
  VerificationAction,
} from "../utils/types";
import FormSection from "../components/ui/FormSection";
import TextInput from "../components/ui/TextInput";
import ArrowButton from "../components/ui/ArrowButton";
import PrivacyNotice from "../components/ui/PrivacyNotice";

/**
 * Verification Plan screen: action checkboxes and evidence note.
 * Uses: FormSection, TextInput, PrimaryButton
 */
export default function VerificationPlanPage({
  actions,
  evidenceNote,
  onComplete,
}: VerificationPlanPageProps) {
  const [localActions, setLocalActions] = useState<VerificationAction[]>(actions);
  const [note, setNote] = useState(evidenceNote);

  function toggleAction(id: string) {
    setLocalActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  }

  const essentialCount = localActions.filter((a) => a.isEssential).length;
  const essentialCompleted = localActions.filter(
    (a) => a.isEssential && a.completed
  ).length;
  const allEssentialDone = essentialCompleted === essentialCount;

  return (
    <div className="flex flex-col gap-6">
      <FormSection
        eyebrow="Step 5 of 5"
        title="Verification plan"
        description="Complete these actions before committing to the rental. Essential actions are marked with a badge."
      >
        <div className="flex flex-col gap-3">
          {localActions.map((action) => (
            <label
              key={action.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors duration-150 ${
                action.completed
                  ? "border-[#2A9D8F] bg-[#2A9D8F]/5"
                  : "border-[#E5E7EB] bg-white hover:border-[#9CA3AF]"
              }`}
            >
              <input
                type="checkbox"
                checked={action.completed}
                onChange={() => toggleAction(action.id)}
                className="mt-0.5 h-5 w-5 flex-shrink-0 cursor-pointer rounded border-[#D1D5DB] text-[#2A9D8F] focus:ring-[#2A9D8F]"
              />
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      action.completed
                        ? "text-[#2A9D8F] line-through"
                        : "text-[#1B2A4A]"
                    }`}
                  >
                    {action.label}
                  </span>
                  {action.isEssential && (
                    <span className="rounded-full bg-[#E76F51]/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#E76F51]">
                      Essential
                    </span>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </FormSection>

      {/* Evidence note */}
      <div className="flex flex-col gap-2">
        <TextInput
          id="verification-evidence-note"
          label="Evidence note"
          value={note}
          onChange={setNote}
          placeholder="Record what you have checked or verified so far..."
          hint="This note is saved with your risk check and linked to your account. Do not include names, phone numbers, passwords, bank details or other sensitive personal information."
          multiline
        />
        <PrivacyNotice>
          Your evidence note is saved together with this risk check and
          associated with your account when you submit. Please do not enter
          names, phone numbers, passwords, bank details or other sensitive
          personal information.
        </PrivacyNotice>
      </div>

      {/* Progress summary */}
      <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
        <p className="text-sm text-[#1B2A4A]">
          <span className="font-semibold">{essentialCompleted}</span> of{" "}
          <span className="font-semibold">{essentialCount}</span> essential
          actions completed
        </p>
        {!allEssentialDone && (
          <p className="mt-1 text-xs text-[#E76F51]">
            Complete all essential actions for a successful result.
          </p>
        )}
      </div>

      <ArrowButton onClick={() => onComplete(localActions, note)}>
        {allEssentialDone
          ? "Complete safety check"
          : "See my result (incomplete)"}
      </ArrowButton>
    </div>
  );
}