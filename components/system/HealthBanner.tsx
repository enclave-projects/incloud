"use client";

import { useState, useEffect, useCallback } from "react";
import type { HealthResponse } from "@/app/api/health/route";

const POLL_INTERVAL_MS = 60_000; // re-check every 60 s
const DISMISS_KEY = "incloud_health_banner_dismissed";

export default function HealthBanner() {
  const [status, setStatus] = useState<"operational" | "down" | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data: HealthResponse = await res.json();
      const isUp = data.status === "operational" || data.status === "degraded";
      setStatus(isUp ? "operational" : "down");

      // If service recovered, clear the dismissal so the banner can show again
      // if it goes down again in the same session
      if (isUp) {
        sessionStorage.removeItem(DISMISS_KEY);
      }
    } catch {
      setStatus("down");
    }
  }, []);

  useEffect(() => {
    // Don't show if the user already dismissed it this session
    if (sessionStorage.getItem(DISMISS_KEY) === "1") {
      setDismissed(true);
    }

    checkHealth();
    const interval = setInterval(checkHealth, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  // Only show when backend is unreachable and user hasn't dismissed
  if (status !== "down" || dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
      style={{
        background: "rgba(239,68,68,0.12)",
        borderBottom: "1px solid rgba(239,68,68,0.25)",
        color: "#fca5a5",
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Warning icon */}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="flex-shrink-0"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="truncate">
          Service disruption detected — some operations may fail.{" "}
          <a
            href="/statusofapp"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            View status
          </a>
        </span>
      </div>

      <button
        onClick={dismiss}
        aria-label="Dismiss service warning"
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
