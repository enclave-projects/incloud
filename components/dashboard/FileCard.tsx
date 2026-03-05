"use client";

import { useState } from "react";
import FileTypeIcon from "@/components/ui/FileTypeIcon";
import Badge from "@/components/ui/Badge";
import type { VaultFile } from "@/lib/mock-data";
import { formatBytes, formatDate, formatDuration } from "@/lib/format";

interface FileCardProps {
  file: VaultFile;
  view: "grid" | "list";
}

function tagVariant(tag: string) {
  if (tag === "final") return "green";
  if (tag === "in-progress") return "blue";
  if (tag === "review") return "amber";
  if (tag === "archived") return "default";
  return "default" as const;
}

/* ── Grid Card ─────────────────────────────────────── */
function GridCard({ file }: { file: VaultFile }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="rounded-2xl flex flex-col overflow-hidden cursor-pointer transition-all duration-200 group"
      style={{
        background: hovered ? "var(--dash-surface-2)" : "var(--dash-surface)",
        border: `1px solid ${hovered ? "var(--dash-border-lg)" : "var(--dash-border)"}`,
        transform: hovered ? "translateY(-1px)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail area */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: 120, background: "rgba(0,0,0,0.2)" }}
      >
        <FileTypeIcon category={file.category} size={32} />

        {/* Backup badge */}
        {file.isBackup && (
          <div
            className="absolute top-2 left-2 flex items-center justify-center w-5 h-5 rounded-full"
            style={{ background: "rgba(251,191,36,0.2)", border: "1px solid rgba(251,191,36,0.4)" }}
            title="Backup"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        )}

        {/* HLS badge */}
        {file.isHLS && (
          <div
            className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: "rgba(59,130,246,0.2)", color: "#60a5fa", letterSpacing: "0.05em" }}
          >
            HLS
          </div>
        )}

        {/* Duration overlay for video/audio */}
        {file.duration && (
          <div
            className="absolute bottom-2 right-2 text-[11px] px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(0,0,0,0.65)", color: "#bfdbfe" }}
          >
            {formatDuration(file.duration)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 flex flex-col gap-1">
        <p
          className="text-sm font-medium truncate leading-snug"
          style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          title={file.name}
        >
          {file.name}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs" style={{ color: "var(--dash-text-2)" }}>
            {formatBytes(file.size)}
          </span>
          <span className="text-xs" style={{ color: "var(--dash-text-3)" }}>
            {formatDate(file.uploadedAt)}
          </span>
        </div>
        {/* Tags row */}
        {file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {file.tags.slice(0, 2).map((t) => (
              <Badge key={t} label={t} variant={tagVariant(t)} />
            ))}
            {file.tags.length > 2 && (
              <span className="text-[11px]" style={{ color: "var(--dash-text-3)" }}>
                +{file.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── List Row ──────────────────────────────────────── */
function ListRow({ file }: { file: VaultFile }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all"
      style={{
        background: hovered ? "var(--dash-surface-2)" : "transparent",
        border: `1px solid ${hovered ? "var(--dash-border)" : "transparent"}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FileTypeIcon category={file.category} size={16} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            {file.name}
          </p>
          {file.isBackup && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" className="flex-shrink-0">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )}
        </div>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--dash-text-3)" }}>
          {file.folder}
        </p>
      </div>

      {/* Tags */}
      <div className="hidden lg:flex items-center gap-1 w-36">
        {file.tags.slice(0, 2).map((t) => (
          <Badge key={t} label={t} variant={tagVariant(t)} />
        ))}
      </div>

      {/* Size */}
      <span className="hidden sm:block text-xs w-20 text-right" style={{ color: "var(--dash-text-2)" }}>
        {formatBytes(file.size)}
      </span>

      {/* Date */}
      <span className="hidden md:block text-xs w-24 text-right" style={{ color: "var(--dash-text-3)" }}>
        {formatDate(file.uploadedAt)}
      </span>

      {/* Action dots */}
      <button
        className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--dash-text-2)" }}
        onClick={(e) => e.stopPropagation()}
        aria-label="File options"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>
  );
}

/* ── Export ────────────────────────────────────────── */
export default function FileCard({ file, view }: FileCardProps) {
  return view === "grid" ? <GridCard file={file} /> : <ListRow file={file} />;
}
