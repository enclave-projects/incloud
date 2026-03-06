"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormInput from "@/components/ui/FormInput";
import { registerUser } from "@/lib/auth";
import { sendSessionAlert } from "@/lib/session-alert";

/* ── Icon helpers ─────────────────────────────────────── */
function UserIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ── Password strength indicator ─────────────────────── */
function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "#E2E8F0" };
  let score = 0;
  if (pwd.length >= 8)  score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { score, label: "Weak",   color: "#F87171" };
  if (score <= 3) return { score, label: "Fair",   color: "#FBBF24" };
  return { score, label: "Strong", color: "#34D399" };
}

/* ── Validation ───────────────────────────────────────── */
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): FormErrors {
  const errs: FormErrors = {};
  if (!name.trim()) {
    errs.name = "Full name is required.";
  } else if (name.trim().length < 2) {
    errs.name = "Name must be at least 2 characters.";
  }
  if (!email.trim()) {
    errs.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errs.email = "Enter a valid email address.";
  }
  if (!password) {
    errs.password = "Password is required.";
  } else if (password.length < 8) {
    errs.password = "Password must be at least 8 characters.";
  }
  if (!confirmPassword) {
    errs.confirmPassword = "Please confirm your password.";
  } else if (confirmPassword !== password) {
    errs.confirmPassword = "Passwords do not match.";
  }
  return errs;
}

/* ── Component ────────────────────────────────────────── */
export default function RegisterForm() {
  const router = useRouter();
  const [name, setName]                       = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors]                   = useState<FormErrors>({});
  const [isLoading, setIsLoading]             = useState(false);
  const [submitted, setSubmitted]             = useState(false);
  const [agreedToTerms, setAgreedToTerms]     = useState(false);
  const [termsError, setTermsError]           = useState(false);

  const strength = passwordStrength(password);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(name, email, password, confirmPassword);
    const hasFormErrors = Object.keys(errs).length > 0;
    const hasTermsError = !agreedToTerms;

    setErrors(errs);
    setTermsError(hasTermsError);

    if (hasFormErrors || hasTermsError) return;

    setIsLoading(true);
    try {
      const profile = await registerUser(name, email, password);
      sendSessionAlert(profile.user_id, name, email, "register");
      setSubmitted(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: unknown) {
      const appErr = err as { code?: number; message?: string; type?: string };
      if (appErr.code === 409 || appErr.type === "user_already_exists") {
        setErrors({ email: "An account with this email already exists." });
      } else if (appErr.code === 429) {
        setErrors({ email: "Too many attempts. Please wait and try again." });
      } else {
        console.error("Registration error:", appErr);
        setErrors({
          email: appErr.message || "Registration failed. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "#EFF6FF" }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#2563EB"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <p className="font-semibold" style={{ color: "#0F172A" }}>
          Account created!
        </p>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Your InCloud is ready.{" "}
          <Link
            href="/login"
            className="font-semibold hover:underline underline-offset-2"
            style={{ color: "#2563EB" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {/* Full name */}
      <FormInput
        label="Full name"
        type="text"
        placeholder="Jane Smith"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        icon={<UserIcon />}
      />

      {/* Email */}
      <FormInput
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        icon={<EmailIcon />}
      />

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <FormInput
          label="Password"
          isPassword
          placeholder="Create a strong password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon={<LockIcon />}
        />

        {/* Strength meter */}
        {password.length > 0 && (
          <div className="flex items-center gap-3 mt-1">
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4, 5].map((seg) => (
                <div
                  key={seg}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{
                    background:
                      seg <= strength.score ? strength.color : "#E2E8F0",
                  }}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: strength.color, minWidth: 40 }}>
              {strength.label}
            </span>
          </div>
        )}
      </div>

      {/* Confirm password */}
      <FormInput
        label="Confirm password"
        isPassword
        placeholder="Re-enter your password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        icon={<LockIcon />}
      />

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5 flex-shrink-0">
          <input
            type="checkbox"
            className="sr-only"
            checked={agreedToTerms}
            onChange={(e) => {
              setAgreedToTerms(e.target.checked);
              if (e.target.checked) setTermsError(false);
            }}
            aria-describedby={termsError ? "terms-error" : undefined}
          />
          <div
            className="w-4 h-4 rounded flex items-center justify-center transition-all"
            style={{
              background: agreedToTerms ? "#2563EB" : "#FFFFFF",
              border: `1.5px solid ${termsError ? "#F87171" : agreedToTerms ? "#2563EB" : "#CBD5E1"}`,
            }}
          >
            {agreedToTerms && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm leading-snug" style={{ color: "#64748B" }}>
          I agree to the{" "}
          <Link
            href="/terms"
            className="font-medium hover:underline underline-offset-2"
            style={{ color: "#2563EB" }}
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-medium hover:underline underline-offset-2"
            style={{ color: "#2563EB" }}
          >
            Privacy Policy
          </Link>
        </span>
      </label>
      {termsError && (
        <p
          id="terms-error"
          className="text-xs -mt-2 flex items-center gap-1"
          style={{ color: "#EF4444" }}
          role="alert"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Please accept the terms to continue.
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white mt-1
                   transition-all duration-200 active:scale-[0.985]
                   disabled:cursor-not-allowed disabled:opacity-70
                   hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)]"
        style={{
          background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)",
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.01em",
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Creating your cloud…
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      {/* Login link */}
      <p className="text-center text-sm" style={{ color: "#64748B" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold hover:underline underline-offset-2"
          style={{ color: "#2563EB" }}
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
