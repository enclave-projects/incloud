"use client";

import { useRef, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { uploadFile } from "@/lib/files";
import { recalculateStorage } from "@/lib/storage-stats";
import { MAX_UPLOAD_SIZE } from "@/lib/config";

interface UploadZoneProps {
  compact?: boolean;
  folderId?: string;
  folderPath?: string;
  onUploadComplete?: () => void;
}

interface PendingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  done: boolean;
  error?: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ compact = false, folderId = "", folderPath = "/", onUploadComplete }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleUpload = useCallback(async (fileList: FileList | null) => {
    if (!fileList || !user) return;

    let hasSuccess = false;

    const incoming: PendingFile[] = Array.from(fileList).map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: f.size,
      progress: 0,
      done: false,
    }));
    setFiles((prev) => [...incoming, ...prev]);

    const rawFiles = Array.from(fileList);

    for (let i = 0; i < rawFiles.length; i++) {
      const raw = rawFiles[i];
      const pf = incoming[i];

      // Validate file size (1 GB limit)
      if (raw.size > MAX_UPLOAD_SIZE) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pf.id
              ? { ...f, progress: 0, done: true, error: `File exceeds 1 GB limit (${formatSize(raw.size)})` }
              : f
          )
        );
        continue;
      }

      try {
        await uploadFile(user.$id, raw, folderId, folderPath, [], (percent) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === pf.id ? { ...f, progress: Math.max(1, Math.round(percent)) } : f))
          );
        });

        setFiles((prev) =>
          prev.map((f) => (f.id === pf.id ? { ...f, progress: 100, done: true } : f))
        );
        hasSuccess = true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        const friendly = msg.includes("size not allowed")
          ? "File too large for bucket. Run: node scripts/update-bucket.mjs"
          : msg.includes("extension not allowed")
            ? "File type blocked by bucket. Run: node scripts/update-bucket.mjs"
            : msg;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === pf.id
              ? { ...f, progress: 0, done: true, error: friendly }
              : f
          )
        );
      }
    }

    if (hasSuccess) {
      await recalculateStorage(user.$id).catch(() => {});
      onUploadComplete?.();
    }
  }, [user, folderId, folderPath, onUploadComplete]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const clearDone = () => setFiles((f) => f.filter((x) => !x.done));

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        className="rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none"
        style={{
          height: compact ? 96 : 160,
          border: `2px dashed ${dragging ? "var(--dash-accent)" : "var(--dash-border)"}`,
          background: dragging ? "rgba(59,130,246,0.05)" : "var(--dash-surface)",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        aria-label="Upload files"
      >
        <svg
          width={compact ? 24 : 32}
          height={compact ? 24 : 32}
          viewBox="0 0 24 24"
          fill="none"
          stroke={dragging ? "var(--dash-accent)" : "var(--dash-text-3)"}
          strokeWidth="1.5" strokeLinecap="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>

        {!compact && (
          <p
            className="mt-3 text-sm font-medium"
            style={{ color: dragging ? "var(--dash-accent)" : "var(--dash-text-2)" }}
          >
            {dragging ? "Drop files here" : "Drag & drop files here"}
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: "var(--dash-text-3)" }}>
          {compact ? "Click or drop" : "or click to browse · Any file type · Up to 1 GB"}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
        aria-label="Upload files"
      />

      {/* Upload list */}
      {files.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--dash-border)", background: "var(--dash-surface)" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: "1px solid var(--dash-border)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--dash-text-2)" }}>
              Uploads ({files.length})
            </p>
            {files.some((f) => f.done) && (
              <button
                className="text-xs"
                style={{ color: "var(--dash-text-3)" }}
                onClick={clearDone}
              >
                Clear done
              </button>
            )}
          </div>

          <div className="flex flex-col divide-y" style={{ borderColor: "var(--dash-border)" }}>
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                {/* Status icon */}
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {f.error ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#ef4444" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  ) : f.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#34d399" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--dash-accent)" strokeWidth="2.5"
                      className="animate-spin"
                      style={{ animation: "spin 1s linear infinite" }}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate" style={{ color: "var(--dash-text)" }}>
                    {f.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="flex-1 rounded-full overflow-hidden"
                      style={{ height: 3, background: "var(--dash-border)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${f.progress}%`,
                          background: f.error ? "#ef4444" : f.done ? "#34d399" : "var(--dash-accent)",
                        }}
                      />
                    </div>
                    <span className="text-[11px] flex-shrink-0" style={{ color: "var(--dash-text-3)" }}>
                      {f.error ? f.error : f.done ? formatSize(f.size) : `${f.progress}%`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
