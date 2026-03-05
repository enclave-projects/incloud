"use client";

import { useRef, useState, useCallback } from "react";

interface UploadZoneProps {
  compact?: boolean;
}

interface PendingFile {
  id: string;
  name: string;
  size: number;
  progress: number;
  done: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ compact = false }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const incoming: PendingFile[] = Array.from(fileList).map((f) => ({
      id: `${f.name}-${Date.now()}`,
      name: f.name,
      size: f.size,
      progress: 0,
      done: false,
    }));
    setFiles((prev) => [...incoming, ...prev]);

    // Simulate progress for each file
    incoming.forEach((pf) => {
      let prog = 0;
      const tick = setInterval(() => {
        prog += Math.random() * 18 + 4;
        if (prog >= 100) {
          prog = 100;
          clearInterval(tick);
          setFiles((prev) =>
            prev.map((f) => (f.id === pf.id ? { ...f, progress: 100, done: true } : f))
          );
        } else {
          setFiles((prev) =>
            prev.map((f) => (f.id === pf.id ? { ...f, progress: Math.round(prog) } : f))
          );
        }
      }, 120);
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    simulateUpload(e.dataTransfer.files);
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
          {compact ? "Click or drop" : "or click to browse · Video, 3D, Image, Audio, LUT, Archive"}
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => simulateUpload(e.target.files)}
        accept=".mp4,.mov,.mkv,.avi,.mxf,.exr,.hdr,.jpg,.jpeg,.png,.tiff,.psd,.ai,.wav,.aiff,.mp3,.flac,.aac,.obj,.fbx,.abc,.glb,.gltf,.blend,.zip,.rar,.7z,.tar,.gz,.cube,.3dl,.look"
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
                  {f.done ? (
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
                          background: f.done ? "#34d399" : "var(--dash-accent)",
                        }}
                      />
                    </div>
                    <span className="text-[11px] flex-shrink-0" style={{ color: "var(--dash-text-3)" }}>
                      {f.done ? formatSize(f.size) : `${f.progress}%`}
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
