interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number";
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  multiline?: boolean;
}

/**
 * Reusable form input with label, hint, and error message.
 * Supports both single-line input and multiline textarea.
 * Never stores state internally — controlled by the parent.
 *
 * Accessibility:
 *  - Label is connected via htmlFor={id}
 *  - Error and hint are linked via aria-describedby
 *  - Error state is exposed via aria-invalid
 *
 * Used on: Login, Rental Details, Verification Plan screens.
 */
export default function TextInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  error,
  required = false,
  multiline = false,
}: TextInputProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const inputClasses = `w-full rounded-lg border px-4 py-3 text-sm text-[#1B2A4A] placeholder:text-[#9CA3AF] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#2A9D8F]/40 ${
    error
      ? "border-[#E76F51] bg-red-50"
      : "border-[#D1D5DB] bg-white hover:border-[#9CA3AF]"
  }`;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-medium text-[#1B2A4A]"
      >
        {label}
        {required && (
          <span className="ml-1 text-[#E76F51]" aria-label="required">
            *
          </span>
        )}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          aria-describedby={errorId || hintId}
          aria-invalid={error ? "true" : undefined}
          rows={4}
          className={`${inputClasses} resize-y`}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          aria-describedby={errorId || hintId}
          aria-invalid={error ? "true" : undefined}
          className={inputClasses}
        />
      )}
      {hint && !error && (
        <p id={hintId} className="text-xs text-[#6B7280]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-[#E76F51]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}