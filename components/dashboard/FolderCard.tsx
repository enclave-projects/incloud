import Link from "next/link";
import type { FolderWithStats } from "@/lib/types";
import { formatBytes } from "@/lib/format";

interface FolderCardProps {
  folder: FolderWithStats;
  onDelete?: (folderId: string) => void;
}

export default function FolderCard({ folder, onDelete }: FolderCardProps) {
  return (
    <Link
      href={`/dashboard/folders?id=${folder.$id}`}
      className="rounded-2xl flex flex-col gap-3.5 p-5 transition-all duration-200 group relative"
      style={{
        background: "var(--dash-surface)",
        border: "1px solid var(--dash-border)",
      }}
    >
      {/* Delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(folder.$id);
          }}
          className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
          title="Delete folder"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
      )}
      {/* Icon + color swatch */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${folder.color}22`, border: `1.5px solid ${folder.color}55` }}
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={folder.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p
          className="font-medium text-sm truncate flex-1"
          style={{
            color: "var(--dash-text)",
            fontFamily: "var(--font-display)",
          }}
        >
          {folder.folder_name}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: "var(--dash-text-3)" }}>
          {folder.fileCount} {folder.fileCount === 1 ? "file" : "files"}
        </span>
        <span className="text-xs" style={{ color: "var(--dash-text-2)" }}>
          {formatBytes(folder.totalSize)}
        </span>
      </div>

      {/* Hover arrow */}
      <div
        className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--dash-accent)" }}
      >
        <span>Open folder</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </Link>
  );
}
