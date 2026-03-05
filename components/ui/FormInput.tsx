"use client";

import { useState, forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
  error?: string;
  isPassword?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, icon, error, isPassword, type, className, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: "#374151" }}
        >
          {label}
        </label>

        <div className="relative">
          {icon && (
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center"
              style={{ color: error ? "#F87171" : "#9CA3AF" }}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={[
              "auth-input w-full rounded-xl border text-sm",
              "px-4 py-3.5 transition-colors",
              icon ? "pl-10" : "",
              isPassword ? "pr-11" : "",
              error
                ? "border-red-300 bg-red-50/50"
                : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]",
              className ?? "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ color: "#0F172A", fontSize: "14px" }}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-0.5
                         transition-colors hover:text-slate-600 focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-blue-500"
              style={{ color: "#9CA3AF" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                /* eye-off */
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                /* eye */
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs flex items-center gap-1"
            style={{ color: "#EF4444" }}
            role="alert"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
export default FormInput;
