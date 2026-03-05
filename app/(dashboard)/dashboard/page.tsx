import { STORAGE_STATS, RECENT_FILES, FOLDERS } from "@/lib/mock-data";
import StorageWidget from "@/components/dashboard/StorageWidget";
import FolderCard from "@/components/dashboard/FolderCard";
import FileCard from "@/components/dashboard/FileCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard — InCloud" };

const QUICK_ACTIONS = [
  {
    label: "Upload Files",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
    ),
    href: "/dashboard/files?upload=1",
    accent: "#3b82f6",
  },
  {
    label: "Browse All Files",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    href: "/dashboard/files",
    accent: "#8b5cf6",
  },
  {
    label: "Backup Vault",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    href: "/dashboard/backup",
    accent: "#f59e0b",
  },
];

export default function DashboardPage() {
  const usedPercent = Math.round((STORAGE_STATS.vaultUsed / STORAGE_STATS.vaultTotal) * 100);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold leading-tight"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            Welcome back, Pranjal
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-2)" }}>
            Your vault is at {usedPercent}% capacity. {usedPercent > 80 ? "Consider cleaning up." : ""}
          </p>
        </div>

        <Link
          href="/dashboard/files?upload=1"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 flex-shrink-0"
          style={{ background: "var(--dash-accent)", color: "#fff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Upload
        </Link>
      </div>

      {/* Top row: Storage + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <StorageWidget />
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--dash-text-3)", letterSpacing: "0.08em" }}
          >
            Quick Actions
          </p>
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-3 rounded-xl p-3 transition-all hover:opacity-80"
              style={{
                background: `${a.accent}18`,
                border: `1px solid ${a.accent}30`,
                color: a.accent,
              }}
            >
              {a.icon}
              <span
                className="text-sm font-medium"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {a.label}
              </span>
              <svg
                className="ml-auto"
                width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Folders section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            Folders
          </h2>
          <Link
            href="/dashboard/folders"
            className="text-xs"
            style={{ color: "var(--dash-accent)" }}
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {FOLDERS.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      </div>

      {/* Recent files */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            Recent Files
          </h2>
          <Link
            href="/dashboard/files"
            className="text-xs"
            style={{ color: "var(--dash-accent)" }}
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {RECENT_FILES.map((file) => (
            <FileCard key={file.id} file={file} view="grid" />
          ))}
        </div>
      </div>
    </div>
  );
}
