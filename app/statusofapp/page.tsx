"use client";

import { useState, useEffect, useCallback } from "react";
import type { HealthResponse, ServiceStatus, HealthStatus } from "@/app/api/health/route";

const REFRESH_INTERVAL_MS = 30_000;

/* ── Primitives ────────────────────────────────────────── */

function dot(status: ServiceStatus | HealthStatus | "checking") {
  return status === "operational"
    ? "#34d399"
    : status === "degraded"
    ? "#fbbf24"
    : status === "checking"
    ? "#4b5563"
    : "#ef4444";
}

function StatusDot({ status }: { status: ServiceStatus | HealthStatus | "checking" }) {
  const c = dot(status);
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{
        background: c,
        boxShadow: status === "operational" ? `0 0 7px ${c}99` : undefined,
      }}
    />
  );
}

function Badge({ status }: { status: ServiceStatus | HealthStatus | "checking" }) {
  const map = {
    operational: { label: "Operational", color: "#34d399", bg: "rgba(52,211,153,0.12)" },
    degraded:    { label: "Degraded",    color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    down:        { label: "Down",        color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
    checking:    { label: "Checking…",   color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
  } as const;
  const cfg = map[status as keyof typeof map] ?? map.checking;
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

/* ── Service row ───────────────────────────────────────── */

interface RowProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  status: ServiceStatus | "checking";
  latency?: number | null;
}

function ServiceRow({ icon, label, description, status, latency }: RowProps) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "#f3f4f6" }}>
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
          {description}
          {status === "operational" && latency != null && (
            <span style={{ color: "#4b5563" }}> · {latency} ms</span>
          )}
        </p>
      </div>
      <Badge status={status} />
    </div>
  );
}

/* ── Icons ─────────────────────────────────────────────── */

const icons = {
  api: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  ),
  auth: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  database: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#34d399" strokeWidth="1.8" strokeLinecap="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  storage: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#fb923c" strokeWidth="1.8" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  realtime: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#f472b6" strokeWidth="1.8" strokeLinecap="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  email: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
};

/* ── Page ──────────────────────────────────────────────── */

export default function StatusPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [checking, setChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_MS / 1000);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const data: HealthResponse = await res.json();
      setHealth(data);
      setLastChecked(new Date());
      setCountdown(REFRESH_INTERVAL_MS / 1000);
    } catch {
      setHealth(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [check]);

  // Countdown ticker
  useEffect(() => {
    if (checking) return;
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [checking]);

  const overall: HealthStatus | "checking" = checking
    ? "checking"
    : health?.status ?? "down";

  const bannerBg =
    overall === "operational" ? "rgba(52,211,153,0.07)"
    : overall === "degraded"  ? "rgba(251,191,36,0.07)"
    : overall === "checking"  ? "rgba(107,114,128,0.07)"
    : "rgba(239,68,68,0.07)";

  const s = health?.services;
  const chk: ServiceStatus | "checking" = "checking";

  const rows: RowProps[] = [
    {
      icon: icons.api,
      label: "API Gateway",
      description: "Core request routing and rate limiting",
      status: checking ? chk : s?.api.status ?? "down",
      latency: s?.api.latency,
    },
    {
      icon: icons.auth,
      label: "Authentication",
      description: "User login, sessions, and access tokens",
      status: checking ? chk : s?.authentication.status ?? "down",
      latency: s?.authentication.latency,
    },
    {
      icon: icons.database,
      label: "Database",
      description: "Structured data storage and queries",
      status: checking ? chk : s?.database.status ?? "down",
      latency: s?.database.latency,
    },
    {
      icon: icons.storage,
      label: "File Storage",
      description: "Binary file upload, download, and management",
      status: checking ? chk : s?.storage.status ?? "down",
      latency: s?.storage.latency,
    },
    {
      icon: icons.realtime,
      label: "Realtime",
      description: "Live event subscriptions and push messaging",
      status: checking ? chk : s?.realtime.status ?? "down",
      latency: s?.realtime.latency,
    },
    {
      icon: icons.email,
      label: "Email Service",
      description: "Transactional emails, notifications, and alerts",
      status: checking ? chk : s?.email.status ?? "down",
      latency: s?.email.latency,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start pt-14 pb-16 px-4"
      style={{ background: "#0c0e14" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-10">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(139,92,246,0.2)" }}
        >
          {icons.api}
        </div>
        <span className="text-base font-semibold" style={{ color: "#f9fafb" }}>
          InCloud
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-md ml-1"
          style={{ background: "rgba(255,255,255,0.06)", color: "#6b7280" }}
        >
          Service Status
        </span>
      </div>

      {/* Overall banner */}
      <div
        className="w-full max-w-xl rounded-2xl px-5 py-4 mb-5 flex items-center gap-4"
        style={{ background: bannerBg, border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <StatusDot status={overall} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "#f9fafb" }}>
            {overall === "operational"
              ? "All systems operational"
              : overall === "degraded"
              ? "Some systems degraded"
              : overall === "checking"
              ? "Checking service status…"
              : "Service disruption detected"}
          </p>
          {health?.latency != null && !checking && (
            <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
              Gateway response time: <span style={{ color: "#9ca3af" }}>{health.latency} ms</span>
            </p>
          )}
        </div>
        <Badge status={overall} />
      </div>

      {/* Service rows */}
      <div
        className="w-full max-w-xl rounded-2xl overflow-hidden mb-5"
        style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}
      >
        <div
          className="px-5 py-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#4b5563", letterSpacing: "0.1em" }}
          >
            Components
          </p>
        </div>
        {rows.map((row) => (
          <ServiceRow key={row.label} {...row} />
        ))}
      </div>

      {/* Footer */}
      <div
        className="w-full max-w-xl flex items-center justify-between text-xs"
        style={{ color: "#4b5563" }}
      >
        <span>
          {lastChecked
            ? `Last checked: ${lastChecked.toLocaleTimeString()}`
            : "Checking…"}
        </span>
        <div className="flex items-center gap-3">
          {!checking && (
            <span>Auto-refresh in {countdown}s</span>
          )}
          <button
            onClick={check}
            disabled={checking}
            className="px-3 py-1.5 rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.06)", color: "#9ca3af" }}
          >
            {checking ? "Checking…" : "Refresh now"}
          </button>
        </div>
      </div>

      <a
        href="/dashboard"
        className="mt-8 text-xs transition-opacity hover:opacity-70"
        style={{ color: "#374151" }}
      >
        ← Back to Dashboard
      </a>
    </div>
  );
}
