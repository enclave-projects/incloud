import StorageBar from "@/components/dashboard/StorageBar";
import { STORAGE_STATS } from "@/lib/mock-data";
import { storagePercent, formatBytes } from "@/lib/format";

export default function StorageWidget() {
  const vaultPct  = storagePercent(STORAGE_STATS.vaultUsed,  STORAGE_STATS.vaultTotal);
  const backupPct = storagePercent(STORAGE_STATS.backupUsed, STORAGE_STATS.backupTotal);
  const vaultWarn  = vaultPct >= 85;
  const backupWarn = backupPct >= 80;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-5"
      style={{
        background: "var(--dash-surface)",
        border: "1px solid var(--dash-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "var(--dash-accent-dim)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="var(--dash-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}>
            Storage
          </span>
        </div>
        <span className="text-xs px-2 py-1 rounded-full"
          style={{ background: "rgba(255,255,255,0.05)", color: "var(--dash-text-2)" }}>
          {formatBytes(STORAGE_STATS.vaultUsed + STORAGE_STATS.backupUsed)} total
        </span>
      </div>

      {/* Vault */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--dash-accent)" }} />
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--dash-text-3)", letterSpacing: "0.1em" }}>
            Vault
          </span>
        </div>
        <StorageBar
          used={STORAGE_STATS.vaultUsed}
          total={STORAGE_STATS.vaultTotal}
          label="In use"
        />
        {vaultWarn && (
          <div className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-2"
            style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Vault is {vaultPct}% full — consider archiving files
          </div>
        )}
      </div>

      {/* Backup */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80" }} />
          <span className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--dash-text-3)", letterSpacing: "0.1em" }}>
            Backup
          </span>
        </div>
        <StorageBar
          used={STORAGE_STATS.backupUsed}
          total={STORAGE_STATS.backupTotal}
          label="Backup used"
        />
        {backupWarn && (
          <div className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-2"
            style={{ background: "rgba(251,191,36,0.1)", color: "#fde68a" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Backup vault at {backupPct}% — review backups
          </div>
        )}
      </div>
    </div>
  );
}
