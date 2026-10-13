import { useState } from "react";
import type { LoginPageProps } from "../utils/types";
import PrimaryButton from "../components/ui/PrimaryButton";
import FormSection from "../components/ui/FormSection";
import TextInput from "../components/ui/TextInput";
import { authApi, ApiError } from "../utils/api";
import { saveSession } from "../utils/auth";

/**
 * Login / signup screen with email/password validation.
 * Real authentication is performed against the RentShield backend
 * (POST /api/auth/login and POST /api/auth/signup) — the backend talks
 * to Supabase; the frontend only ever sees a session token.
 * Uses: PrimaryButton, FormSection, TextInput
 */
export default function LoginPage({ onComplete }: LoginPageProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [status, setStatus] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function switchMode(next: "signin" | "signup") {
    setMode(next);
    setStatus(null);
    setErrors({});
  }

  async function handleSignIn() {
    if (!validate()) return;

    setStatus(null);
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const result = await authApi.signup(email.trim(), password);
        if (result.access_token) {
          saveSession({
            email: result.email || email.trim(),
            access_token: result.access_token,
            user_id: result.user_id,
            demo: false,
          });
          setStatus({ kind: "success", text: "Account created. You are now signed in." });
          onComplete({ email: result.email || email.trim() });
        } else {
          setStatus({
            kind: "success",
            text: "Account created. Check your inbox to confirm your email, then sign in.",
          });
          setMode("signin");
        }
      } else {
        const result = await authApi.login(email.trim(), password);
        saveSession({
          email: result.email || email.trim(),
          access_token: result.access_token,
          user_id: result.user_id,
          demo: false,
        });
        setStatus({ kind: "success", text: "Signed in successfully." });
        onComplete({ email: result.email || email.trim() });
      }
    } catch (err) {
      setStatus({
        kind: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "Could not reach the server. Please check your connection and try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleDemoAccess() {
    saveSession({
      email: "demo.student@latrobe.edu.au",
      access_token: null,
      user_id: null,
      demo: true,
    });
    onComplete({ email: "demo.student@latrobe.edu.au" });
  }

  return (
    <div className="flex flex-col gap-6">
      <FormSection
        eyebrow="Step 1 of 5"
        title={mode === "signin" ? "Sign in to RentShield" : "Create your RentShield account"}
        description={
          mode === "signin"
            ? "Enter your email and password to continue, or use demo access to explore the prototype."
            : "Create an account to save your safety checks and keep your verification records."
        }
      >
        <div className="flex flex-col gap-4">
          <TextInput
            id="login-email"
            label="Email"
            value={email}
            onChange={(val) => {
              setEmail(val);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            type="email"
            placeholder="your.email@university.edu.au"
            error={errors.email}
            required
          />
          <TextInput
            id="login-password"
            label="Password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            type="password"
            placeholder="Enter your password"
            hint="Minimum 6 characters"
            error={errors.password}
            required
          />
        </div>
      </FormSection>

      {/* Success / error messages */}
      {status && (
        <div
          role="alert"
          className={`rounded-lg border p-3 text-sm ${
            status.kind === "error"
              ? "border-[#E76F51]/40 bg-[#E76F51]/5 text-[#E76F51]"
              : "border-[#2A9D8F]/40 bg-[#2A9D8F]/5 text-[#2A9D8F]"
          }`}
        >
          {status.text}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <PrimaryButton
          type="submit"
          onClick={handleSignIn}
          loading={submitting}
          loadingText={mode === "signup" ? "Creating account..." : "Signing in..."}
        >
          {mode === "signup" ? "Create Account" : "Sign In"}
        </PrimaryButton>

        <p className="text-center text-xs text-[#6B7280]">
          {mode === "signin" ? "New to RentShield?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="font-semibold text-[#2A9D8F] underline-offset-2 hover:underline"
          >
            {mode === "signin" ? "Create an account" : "Sign in"}
          </button>
        </p>

        <div className="relative flex items-center justify-center">
          <div className="h-px w-full bg-[#E5E7EB]" />
          <span className="absolute bg-[#F8F9FA] px-3 text-xs text-[#9CA3AF]">
            or
          </span>
        </div>

        <PrimaryButton variant="secondary" onClick={handleDemoAccess}>
          Enter Demo
        </PrimaryButton>
      </div>

      <p className="text-center text-xs text-[#9CA3AF]">
        Demo access uses fictional data only. No real account is created.
      </p>
    </div>
  );
}
