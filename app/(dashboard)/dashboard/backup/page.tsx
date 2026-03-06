"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { listBackupFiles } from "@/lib/files";
import { getStorageStats } from "@/lib/storage-stats";
import type { ParsedVaultFile, StorageStats } from "@/lib/types";
import StorageBar from "@/components/dashboard/StorageBar";
import FileManager from "@/components/dashboard/FileManager";

export default function BackupPage() {
  const { user } = useAuth();
  const [backupFiles, setBackupFiles] = useState<ParsedVaultFile[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);

  const fetchBackup = useCallback(() => {
    if (!user) return;
    listBackupFiles(user.$id).then((res) => setBackupFiles(res.files)).catch(() => {});
    getStorageStats(user.$id).then(setStats).catch(() => {});
  }, [user]);

  useEffect(() => { fetchBackup(); }, [fetchBackup]);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            Backup Vault
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
            {backupFiles.length} files backed up
          </p>
        </div>
      </div>

      {/* Storage bar */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
      >
        <StorageBar
          used={stats?.backupUsed ?? 0}
          total={stats?.backupTotal ?? 1}
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
        <FileManager files={backupFiles} onMutate={fetchBackup} defaultView="list" />
      </div>
    </div>
  );
}
