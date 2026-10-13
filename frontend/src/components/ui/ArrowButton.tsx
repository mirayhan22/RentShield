import { ArrowRight } from "lucide-react";

interface ArrowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  className?: string;
}

/**
 * Button with animated arrow icon — adapted from 21st.dev Origin UI
 * "Button with animated arrow" component.
 *
 * Source: https://21st.dev/community/components/originui/button/button-with-animated-arrow
 *
 * The arrow icon translates 0.5rem right on hover using Tailwind's group-hover.
 * Identified by data-component="21st-dev-arrow-button" in the DOM.
 *
 * Used on: Rental Details, Quick Check, Risk Result screens.
 */
export default function ArrowButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
  className = "",
}: ArrowButtonProps) {
  const baseClasses =
    "group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer";

  const variantClasses = {
    primary:
      "bg-[#1B2A4A] text-white hover:bg-[#243656] focus-visible:outline-[#1B2A4A] disabled:bg-[#9CA3AF]",
    secondary:
      "border-2 border-[#2A9D8F] text-[#2A9D8F] bg-transparent hover:bg-[#2A9D8F]/10 focus-visible:outline-[#2A9D8F] disabled:border-[#9CA3AF] disabled:text-[#9CA3AF]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-component="21st-dev-arrow-button"
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}
    >
      {children}
      <ArrowRight
        className="-me-1 ms-2 opacity-60 transition-transform group-hover:translate-x-0.5"
        size={16}
        strokeWidth={2}
        aria-hidden="true"
      />
    </button>
  );
}