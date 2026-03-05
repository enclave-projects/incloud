"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormInput from "@/components/ui/FormInput";

/* ── Icon helpers ─────────────────────────────────────── */
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

/* ── Validation ───────────────────────────────────────── */
interface FormErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FormErrors {
  const errs: FormErrors = {};
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
  return errs;
}

/* ── Component ────────────────────────────────────────── */
export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsLoading(true);
    // TODO: wire up Appwrite/auth provider here
    await new Promise((r) => setTimeout(r, 1400));
    setIsLoading(false);
    setSubmitted(true);
    router.push("/dashboard");
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
          Signed in successfully!
        </p>
        <p className="text-sm" style={{ color: "#64748B" }}>
          Redirecting you to your cloud…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
      <div className="flex flex-col gap-1">
        <FormInput
          label="Password"
          isPassword
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          icon={<LockIcon />}
        />
        <div className="flex justify-end mt-1.5">
          <Link
            href="/forgot-password"
            className="text-xs font-medium hover:underline underline-offset-2"
            style={{ color: "#2563EB" }}
          >
            Forgot password?
          </Link>
        </div>
      </div>

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
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="3"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Signing in…
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
        <span className="text-xs" style={{ color: "#94A3B8" }}>
          or
        </span>
        <div className="flex-1 h-px" style={{ background: "#E2E8F0" }} />
      </div>

      {/* Register link */}
      <p className="text-center text-sm" style={{ color: "#64748B" }}>
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold hover:underline underline-offset-2"
          style={{ color: "#2563EB" }}
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
