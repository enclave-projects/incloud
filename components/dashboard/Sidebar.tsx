"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import InCloudLogo from "@/components/ui/InCloudLogo";
import StorageBar from "@/components/dashboard/StorageBar";
import { STORAGE_STATS, FOLDERS } from "@/lib/mock-data";

/* ── Nav items ─────────────────────────────────────── */
const NAV_MAIN = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 1-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6",
  },
  {
    href: "/dashboard/files",
    label: "All Files",
    icon: "M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z",
  },
  {
    href: "/dashboard/folders",
    label: "Folders",
    icon: "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z",
  },
  {
    href: "/dashboard/search",
    label: "Search",
    icon: "m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z",
  },
  {
    href: "/dashboard/backup",
    label: "Backup Vault",
    icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z",
    accent: true,
  },
];

const NAV_BOTTOM = [
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-full dash-scroll overflow-y-auto"
      style={{
        background: "var(--dash-sidebar)",
        borderRight: "1px solid var(--dash-border)",
        width: 232,
        minWidth: 232,
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0">
        <InCloudLogo variant="light" size="sm" />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "var(--dash-border)", margin: "0 12px" }} />

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 px-3 pt-4 flex-1">
        {NAV_MAIN.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150 group"
              style={{
                color: active
                  ? "#dde8fa"
                  : item.accent
                  ? "#fb923c"
                  : "var(--dash-text-2)",
                background: active ? "var(--dash-accent-dim)" : "transparent",
                fontWeight: active ? 500 : 400,
                fontFamily: "var(--font-display)",
              }}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={active ? "var(--dash-accent)" : item.accent ? "#fb923c" : "currentColor"}
                strokeWidth={active ? 2 : 1.75}
                strokeLinecap="round" strokeLinejoin="round"
                className="flex-shrink-0 transition-colors"
              >
                <path d={item.icon} />
              </svg>
              {item.label}
              {item.accent && (
                <span
                  className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(251,146,60,0.15)", color: "#fb923c" }}
                >
                  10 GB
                </span>
              )}
            </Link>
          );
        })}

        {/* Folders quick-access */}
        <div className="mt-4 mb-1 px-3">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--dash-text-3)", letterSpacing: "0.12em" }}
          >
            Quick Folders
          </span>
        </div>
        {FOLDERS.slice(0, 5).map((folder) => (
          <Link
            key={folder.id}
            href={`/dashboard/folders?id=${folder.id}`}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-sm
                       transition-colors group"
            style={{ color: "var(--dash-text-2)" }}
          >
            <div
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: folder.color }}
            />
            <span className="truncate text-[13px]">{folder.name}</span>
            <span
              className="ml-auto text-[11px] flex-shrink-0"
              style={{ color: "var(--dash-text-3)" }}
            >
              {folder.fileCount}
            </span>
          </Link>
        ))}
      </nav>

      {/* Bottom: storage + settings */}
      <div className="px-3 pb-4 flex flex-col gap-2 flex-shrink-0">
        {/* Mini storage bar */}
        <div
          className="rounded-xl p-3 flex flex-col gap-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--dash-border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: "var(--dash-text-2)" }}>Vault</span>
            <span className="text-[11px] font-medium" style={{ color: "var(--dash-text)" }}>
              {Math.round((STORAGE_STATS.vaultUsed / STORAGE_STATS.vaultTotal) * 100)}%
            </span>
          </div>
          <StorageBar
            used={STORAGE_STATS.vaultUsed}
            total={STORAGE_STATS.vaultTotal}
            label=""
            showValues={false}
            height={3}
          />
        </div>

        {/* Settings link */}
        {NAV_BOTTOM.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                color: active ? "#dde8fa" : "var(--dash-text-2)",
                background: active ? "var(--dash-accent-dim)" : "transparent",
                fontFamily: "var(--font-display)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={active ? "var(--dash-accent)" : "currentColor"}
                strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
