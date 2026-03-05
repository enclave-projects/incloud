"use client";

import { useState } from "react";
import { BACKUP_FILES, STORAGE_STATS } from "@/lib/mock-data";
import StorageBar from "@/components/dashboard/StorageBar";
import FileGrid from "@/components/dashboard/FileGrid";

export default function BackupPage() {
  const [view, setView] = useState<"grid" | "list">("list");

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            Backup Vault
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
            {BACKUP_FILES.length} files backed up
          </p>
        </div>
      </div>

      {/* Storage bar */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
      >
        <StorageBar
          used={STORAGE_STATS.backupUsed}
          total={STORAGE_STATS.backupTotal}
          label="Backup Storage"
          showValues
        />
        <p className="text-xs mt-3" style={{ color: "var(--dash-text-3)" }}>
          Files marked as backup are stored here. They do not count towards
          your main vault quota.
        </p>
      </div>

      {/* Backed-up files */}
      <div>
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--dash-text-2)", fontFamily: "var(--font-display)" }}
        >
          Backed-up Files
        </h2>
        <FileGrid files={BACKUP_FILES} view={view} onViewChange={setView} />
      </div>
    </div>
  );
}
