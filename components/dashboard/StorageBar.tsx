import { storagePercent, storageBarColor, formatBytes } from "@/lib/format";

interface StorageBarProps {
  used: number;
  total: number;
  label: string;
  showValues?: boolean;
  height?: number;
}

export default function StorageBar({
  used,
  total,
  label,
  showValues = true,
  height = 5,
}: StorageBarProps) {
  const pct = storagePercent(used, total);
  const color = storageBarColor(pct);

  return (
    <div className="flex flex-col gap-1.5">
      {showValues && (
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--dash-text-2)" }}>
            {label}
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--dash-text)" }}>
            {formatBytes(used)}{" "}
            <span style={{ color: "var(--dash-text-3)" }}>/ {formatBytes(total)}</span>
          </span>
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {showValues && (
        <div className="flex justify-end">
          <span className="text-[11px]" style={{ color: "var(--dash-text-3)" }}>
            {pct}% used
          </span>
        </div>
      )}
    </div>
  );
}
