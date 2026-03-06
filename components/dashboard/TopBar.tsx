"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import InCloudLogo from "@/components/ui/InCloudLogo";
import { useAuth } from "@/lib/auth-context";

interface TopBarProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function TopBar({ title, breadcrumbs }: TopBarProps) {
  const [query, setQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const initial = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?";

  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <header
      className="flex items-center gap-4 px-8 flex-shrink-0"
      style={{
        height: 64,
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

        {/* Avatar / User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all"
            style={{
              background: userMenuOpen ? "var(--dash-accent)" : "var(--dash-accent-dim)",
              color: userMenuOpen ? "#fff" : "var(--dash-accent)",
              fontFamily: "var(--font-display)",
              border: `1px solid ${userMenuOpen ? "var(--dash-accent)" : "rgba(59,130,246,0.2)"}`,
            }}
          >
            {initial}
          </button>
          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 rounded-xl py-2 z-50 animate-fade-up"
              style={{
                width: 220,
                background: "var(--dash-surface-2)",
                border: "1px solid var(--dash-border-lg)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
              }}
            >
              <div className="px-4 py-2.5">
                <p className="text-sm font-medium truncate" style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}>
                  {user?.name || "User"}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--dash-text-3)" }}>
                  {user?.email}
                </p>
              </div>
              <div style={{ height: 1, background: "var(--dash-border)", margin: "4px 12px" }} />
              <Link
                href="/dashboard/settings"
                onClick={() => setUserMenuOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors"
                style={{ color: "var(--dash-text-2)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs transition-colors"
                style={{ color: "#ef4444" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
