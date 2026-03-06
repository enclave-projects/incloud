"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-5 p-12 text-center h-full">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.1)" }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>

      <div className="flex flex-col gap-1.5 max-w-sm">
        <h2
          className="text-base font-semibold"
          style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
        >
          Page failed to load
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--dash-text-3)" }}>
          {error.message || "An unexpected error occurred on this page."}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={reset}
          className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--dash-accent)", color: "#fff" }}
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="text-sm px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
          style={{ color: "var(--dash-text-2)", background: "rgba(255,255,255,0.05)" }}
        >
          Dashboard
        </a>
      </div>
    </div>
  );
}
