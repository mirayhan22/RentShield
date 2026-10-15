interface YesNoButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * Simple Yes/No toggle button used in rental-details and quick-check forms.
 * Extracted from RentalDetailsPage.tsx and QuickCheckPage.tsx to remove duplication.
 */
export default function YesNoButton({
  label,
  selected,
  onClick,
}: YesNoButtonProps) {
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