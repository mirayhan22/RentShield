interface PrimaryButtonProps {
  variant?: "primary" | "secondary" | "quiet";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
}

/**
 * Reusable semantic button with primary, secondary, and quiet variants.
 * Supports disabled state, loading text, and custom className for extension.
 * Does not embed navigation logic.
 *
 * Used on: Login, Verification Plan, Confirmation screens.
 */
export default function PrimaryButton({
  variant = "primary",
  children,
  onClick,
  disabled = false,
  loading = false,
  loadingText,
  type = "button",
  className = "",
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses =
    "inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2";

  const variantClasses = {
    primary:
      "bg-[#1B2A4A] text-white hover:bg-[#243656] focus-visible:outline-[#1B2A4A] disabled:bg-[#9CA3AF]",
    secondary:
      "border-2 border-[#2A9D8F] text-[#2A9D8F] bg-transparent hover:bg-[#2A9D8F]/10 focus-visible:outline-[#2A9D8F] disabled:border-[#9CA3AF] disabled:text-[#9CA3AF]",
    quiet:
      "text-[#2A9D8F] bg-transparent hover:bg-[#2A9D8F]/10 focus-visible:outline-[#2A9D8F] disabled:text-[#9CA3AF]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-25"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="opacity-75"
          />
        </svg>
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}