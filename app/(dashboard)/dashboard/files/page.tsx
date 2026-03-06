"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { listFiles } from "@/lib/files";
import type { ParsedVaultFile } from "@/lib/types";
import FileManager from "@/components/dashboard/FileManager";
import UploadZone from "@/components/dashboard/UploadZone";
import ErrorBoundary from "@/components/system/ErrorBoundary";

function FilesContent() {
  const [showUpload, setShowUpload] = useState(false);
  const [files, setFiles] = useState<ParsedVaultFile[]>([]);
  const [total, setTotal] = useState(0);
  const params = useSearchParams();
  const { user } = useAuth();

  const fetchFiles = useCallback(() => {
    if (!user) return;
    listFiles(user.$id, { limit: 100 })
      .then((res) => { setFiles(res.files); setTotal(res.total); })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    if (params.get("upload") === "1") setShowUpload(true);
  }, [params]);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            All Files
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
            {total} files in your vault
          </p>
        </div>

        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--dash-accent)", color: "#fff" }}
          onClick={() => setShowUpload((v) => !v)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Upload
        </button>
      </div>

      {/* Upload zone */}
      {showUpload && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}>
              Upload Files
            </p>
            <button onClick={() => setShowUpload(false)} style={{ color: "var(--dash-text-3)" }} aria-label="Close upload panel">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <ErrorBoundary label="Upload Zone">
            <UploadZone onUploadComplete={fetchFiles} />
          </ErrorBoundary>
        </div>
      )}

      {/* File manager (grid + all modals) */}
      <ErrorBoundary label="File Manager">
        <FileManager files={files} onMutate={fetchFiles} />
      </ErrorBoundary>
    </div>
  );
}

export default function FilesPage() {
  return (
    <Suspense>
      <FilesContent />
    </Suspense>
  );
}
