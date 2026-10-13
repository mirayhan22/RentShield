import { useState } from "react";
import type { QuickCheckPageProps, QuickCheckAnswers } from "../utils/types";
import FormSection from "../components/ui/FormSection";
import ArrowButton from "../components/ui/ArrowButton";

/**
 * Quick Check screen: four yes/no warning-sign questions.
 * Uses: FormSection, PrimaryButton, ArrowButton
 */
export default function QuickCheckPage({
  initialData,
  onComplete,
}: QuickCheckPageProps) {
  const [answers, setAnswers] = useState<QuickCheckAnswers>(initialData);
  const [error, setError] = useState("");
  const [unansweredKeys, setUnansweredKeys] = useState<Set<string>>(new Set());

  const questions: {
    key: keyof QuickCheckAnswers;
    question: string;
    helpText: string;
  }[] = [
    {
      key: "pressuredToPay",
      question: "Were you pressured to pay quickly?",
      helpText:
        "For example, the landlord or agent said others are interested, or set a tight deadline.",
    },
    {
      key: "noWrittenAgreement",
      question: "Is there no written lease or rooming agreement?",
      helpText:
        "A verbal agreement offers little protection under Victorian tenancy law.",
    },
    {
      key: "unregulatedSource",
      question: "Is the listing from an unregulated source?",
      helpText:
        "For example, a social media post, classified ad, or messaging app rather than a licensed agent.",
    },
    {
      key: "unusuallyLowRent",
      question: "Is the rent unusually low for the area?",
      helpText:
        "If the price seems too good to be true, it may be a red flag.",
    },
  ];

  const allAnswered = Object.values(answers).every((v) => v !== null);

  function handleAnswer(key: keyof QuickCheckAnswers, value: boolean) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setUnansweredKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    if (error) setError("");
  }

  function handleSubmit() {
    const missing = questions
      .filter((q) => answers[q.key] === null)
      .map((q) => q.key);
    if (missing.length > 0) {
      setUnansweredKeys(new Set(missing));
      setError("Please answer all questions before continuing.");
      return;
    }
    onComplete(answers);
  }

  return (
    <div className="flex flex-col gap-6">
      <FormSection
        eyebrow="Step 3 of 5"
        title="Quick check"
        description="Answer these four questions about warning signs. Your answers help us assess the risk level."
      >
        <div className="flex flex-col gap-5">
          {questions.map((q) => (
            <div
              key={q.key}
              className={`flex flex-col gap-2 rounded-lg border p-3 transition-colors duration-150 ${
                unansweredKeys.has(q.key)
                  ? "border-[#E76F51] bg-red-50"
                  : "border-transparent bg-transparent"
              }`}
            >
              <p className="text-sm font-medium text-[#1B2A4A]">{q.question}</p>
              <p className="text-xs text-[#6B7280]">{q.helpText}</p>
              <div className="flex gap-3">
                <YesNoButton
                  label="Yes"
                  selected={answers[q.key] === true}
                  onClick={() => handleAnswer(q.key, true)}
                />
                <YesNoButton
                  label="No"
                  selected={answers[q.key] === false}
                  onClick={() => handleAnswer(q.key, false)}
                />
              </div>
              {unansweredKeys.has(q.key) && (
                <p className="text-xs font-medium text-[#E76F51]" role="alert">
                  Please select an answer.
                </p>
              )}
            </div>
          ))}
        </div>
      </FormSection>

      {error && (
        <p className="text-sm font-medium text-[#E76F51]" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <ArrowButton onClick={handleSubmit}>
          See my risk result
        </ArrowButton>
        {!allAnswered && !error && (
          <p className="text-xs text-[#9CA3AF]">
            Answer all questions to continue.
          </p>
        )}
      </div>
    </div>
  );
}

/** Simple Yes/No toggle button */
function YesNoButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
        selected
          ? "border-[#2A9D8F] bg-[#2A9D8F]/10 text-[#2A9D8F]"
          : "border-[#D1D5DB] bg-white text-[#6B7280] hover:border-[#9CA3AF]"
      }`}
    >
      {label}
    </button>
  );
}