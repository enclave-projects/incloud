"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import InCloudLogo from "@/components/ui/InCloudLogo";

interface TopBarProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function TopBar({ title, breadcrumbs }: TopBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header
      className="flex items-center gap-4 px-6 flex-shrink-0"
      style={{
        height: 60,
        background: "var(--dash-sidebar)",
        borderBottom: "1px solid var(--dash-border)",
      }}
    >
      {/* Mobile logo */}
      <div className="lg:hidden flex-shrink-0">
        <InCloudLogo variant="light" size="sm" />
      </div>

      {/* Breadcrumb / title */}
      <div className="flex-1 min-w-0 hidden sm:flex items-center gap-2">
        {breadcrumbs ? (
          <nav className="flex items-center gap-1.5">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="var(--dash-text-3)" strokeWidth="2" strokeLinecap="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: i === breadcrumbs.length - 1 ? "var(--dash-text)" : "var(--dash-text-2)" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className="text-sm"
                    style={{ color: i === breadcrumbs.length - 1 ? "var(--dash-text)" : "var(--dash-text-2)" }}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        ) : (
          title && (
            <h1
              className="text-base font-semibold truncate"
              style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
            >
              {title}
            </h1>
          )
        )}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--dash-text-3)" strokeWidth="2" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search files, folders, tags…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm transition-all outline-none"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--dash-border)",
              color: "var(--dash-text)",
              fontSize: "13px",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(59,130,246,0.5)";
              e.target.style.background = "rgba(255,255,255,0.07)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--dash-border)";
              e.target.style.background = "rgba(255,255,255,0.05)";
            }}
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Upload button */}
        <Link
          href="/dashboard/files?upload=1"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all
                     hover:brightness-110 active:scale-95"
          style={{
            background: "var(--dash-accent)",
            color: "#fff",
            fontFamily: "var(--font-display)",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5m-7 7 7-7 7 7" />
          </svg>
          Upload
        </Link>

        {/* Notifications */}
        <button
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors relative"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--dash-border)" }}
          aria-label="Notifications"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="var(--dash-text-2)" strokeWidth="1.75" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {/* Dot indicator */}
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--dash-accent)" }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0"
          style={{
            background: "var(--dash-accent-dim)",
            color: "var(--dash-accent)",
            fontFamily: "var(--font-display)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          P
        </div>
      </div>
    </header>
  );
}
