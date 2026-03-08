"use client";

import { useState, useRef, useEffect } from "react";
import FileTypeIcon from "@/components/ui/FileTypeIcon";
import Badge from "@/components/ui/Badge";
import type { ParsedVaultFile } from "@/lib/types";
import { formatBytes, formatDate, formatDuration } from "@/lib/format";
import { getThumbnailUrl } from "@/lib/files";

interface FileCardProps {
  file: ParsedVaultFile;
  view: "grid" | "list";
  onAction?: (action: string, file: ParsedVaultFile) => void;
}

function tagVariant(tag: string) {
  if (tag === "final") return "green";
  if (tag === "in-progress") return "blue";
  if (tag === "review") return "amber";
  if (tag === "archived") return "default";
  return "default" as const;
}

/* ── Context Menu ──────────────────────────────────── */
const MENU_ITEMS = (isBackup: boolean) => [
  { key: "preview", label: "Preview" },
  { key: "download", label: "Download" },
  { key: "rename", label: "Rename" },
  { key: "move", label: "Move to Folder" },
  { key: "backup", label: isBackup ? "Remove from Backup" : "Add to Backup" },
  { key: "tags", label: "Manage Tags" },
  { key: "delete", label: "Delete", danger: true },
];

function FileMenu({
  file,
  onAction,
  onClose,
}: {
  file: ParsedVaultFile;
  onAction: (a: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute z-40 rounded-xl py-1.5 animate-fade-up"
      style={{
        right: 0,
        top: "100%",
        marginTop: 4,
        width: 190,
        background: "var(--dash-surface-2)",
        border: "1px solid var(--dash-border-lg)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      }}
    >
      {MENU_ITEMS(file.is_backup).map((item) => (
        <button
          key={item.key}
          onClick={(e) => {
            e.stopPropagation();
            onAction(item.key);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors text-left"
          style={{
            color: item.danger ? "#ef4444" : "var(--dash-text-2)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ── 3-dot button ──────────────────────────────────── */
function MenuButton({
  file,
  onAction,
  className = "",
}: {
  file: ParsedVaultFile;
  onAction: (action: string, file: ParsedVaultFile) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
        style={{ color: "var(--dash-text-2)", background: open ? "rgba(255,255,255,0.08)" : "transparent" }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(!open);
        }}
        aria-label="File options"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
        </svg>
      </button>
      {open && (
        <FileMenu
          file={file}
          onAction={(a) => onAction(a, file)}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/* ── Grid Card ─────────────────────────────────────── */
function GridCard({
  file,
  onAction,
}: {
  file: ParsedVaultFile;
  onAction?: (action: string, file: ParsedVaultFile) => void;
}) {
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
      onClick={() => onAction?.("preview", file)}
    >
      {/* Thumbnail area */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{ height: 140, background: "rgba(0,0,0,0.2)" }}
      >
        {file.thumbnail_file_id ? (
          <img
            src={getThumbnailUrl(file.thumbnail_file_id)}
            alt={file.filename}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <FileTypeIcon category={file.category} size={32} />
        )}

        {/* Backup badge */}
        {file.is_backup && (
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

        {/* 3-dot menu */}
        {onAction && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <MenuButton file={file} onAction={onAction} />
          </div>
        )}

        {/* Duration overlay for video/audio */}
        {file.duration > 0 && (
          <div
            className="absolute bottom-2 right-2 text-[11px] px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(0,0,0,0.65)", color: "#bfdbfe" }}
          >
            {formatDuration(file.duration)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3.5 flex flex-col gap-1.5">
        <p
          className="text-sm font-medium truncate leading-snug"
          style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          title={file.filename}
        >
          {file.filename}
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs" style={{ color: "var(--dash-text-2)" }}>
            {formatBytes(file.file_size)}
          </span>
          <span className="text-xs" style={{ color: "var(--dash-text-3)" }}>
            {formatDate(file.upload_date)}
          </span>
        </div>
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
function ListRow({
  file,
  onAction,
}: {
  file: ParsedVaultFile;
  onAction?: (action: string, file: ParsedVaultFile) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all group"
      style={{
        background: hovered ? "var(--dash-surface-2)" : "transparent",
        border: `1px solid ${hovered ? "var(--dash-border)" : "transparent"}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onAction?.("preview", file)}
    >
      <FileTypeIcon category={file.category} size={16} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-medium truncate"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            {file.filename}
          </p>
          {file.is_backup && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#fbbf24" className="flex-shrink-0">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )}
        </div>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--dash-text-3)" }}>
          {file.folder_path}
        </p>
      </div>

      <div className="hidden lg:flex items-center gap-1 w-36">
        {file.tags.slice(0, 2).map((t) => (
          <Badge key={t} label={t} variant={tagVariant(t)} />
        ))}
      </div>

      <span className="hidden sm:block text-xs w-20 text-right" style={{ color: "var(--dash-text-2)" }}>
        {formatBytes(file.file_size)}
      </span>

      <span className="hidden md:block text-xs w-24 text-right" style={{ color: "var(--dash-text-3)" }}>
        {formatDate(file.upload_date)}
      </span>

      {onAction ? (
        <MenuButton file={file} onAction={onAction} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      ) : (
        <div className="w-7" />
      )}
    </div>
  );
}

/* ── Export ────────────────────────────────────────── */
export default function FileCard({ file, view, onAction }: FileCardProps) {
  return view === "grid" ? (
    <GridCard file={file} onAction={onAction} />
  ) : (
    <ListRow file={file} onAction={onAction} />
  );
}
