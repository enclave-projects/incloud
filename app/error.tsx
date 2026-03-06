"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center"
      style={{ background: "var(--dash-bg, #0f1117)" }}
    >
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.12)" }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <div className="flex flex-col gap-2 max-w-md">
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--dash-text, #fff)", fontFamily: "var(--font-display)" }}
        >
          Application Error
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "var(--dash-text-3, #9ca3af)" }}>
          Something unexpected happened. This has been logged automatically.
        </p>
        {error.digest && (
          <p className="text-xs font-mono mt-1" style={{ color: "var(--dash-text-3, #6b7280)" }}>
            Error ID: {error.digest}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="text-sm px-5 py-2.5 rounded-xl font-medium transition-opacity hover:opacity-80"
          style={{ background: "#3b82f6", color: "#fff" }}
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="text-sm px-5 py-2.5 rounded-xl transition-opacity hover:opacity-80"
          style={{ color: "var(--dash-text-2, #d1d5db)", background: "rgba(255,255,255,0.06)" }}
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
