interface FormSectionProps {
  title: string;
  description: string;
  eyebrow?: string;
  children: React.ReactNode;
}

/**
 * Reusable card section with consistent padding, border, radius,
 * heading hierarchy, and responsive spacing.
 *
 * Does not own any form state — accepts content via children.
 *
 * Used on: Login, Rental Details, Quick Check, Risk Result, Verification Plan.
 */
export default function FormSection({
  title,
  description,
  eyebrow,
  children,
}: FormSectionProps) {
  return (
    <section
      aria-labelledby="section-title"
      className="rounded-xl border border-[#E5E7EB] bg-white p-4 sm:p-6"
    >
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <p
            className="truncate text-xs font-semibold uppercase tracking-wider text-[#2A9D8F]"
            aria-hidden="true"
          >
            {eyebrow}
          </p>
        )}
        <h2
          id="section-title"
          className="text-xl font-bold leading-tight text-[#1B2A4A]"
        >
          {title}
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[#6B7280]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}