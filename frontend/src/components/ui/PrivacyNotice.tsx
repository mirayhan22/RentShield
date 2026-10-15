interface PrivacyNoticeProps {
  children: React.ReactNode;
}

/**
 * Reusable privacy / data-usage notice banner.
 * Accepts its message via children so each screen can state
 * truthful, context-specific information.
 *
 * Uses the RentShield visual style (rounded card, muted background).
 */
export default function PrivacyNotice({ children }: PrivacyNoticeProps) {
  return (
    <div
      role="note"
      className="rounded-lg border border-[#D1D5DB] bg-[#F8F9FA] p-3"
    >
      <p className="text-xs leading-relaxed text-[#6B7280]">
        <span className="font-semibold text-[#1B2A4A]">Privacy: </span>
        {children}
      </p>
    </div>
  );
}