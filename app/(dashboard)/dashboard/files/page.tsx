"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_FILES } from "@/lib/mock-data";
import FileGrid from "@/components/dashboard/FileGrid";
import UploadZone from "@/components/dashboard/UploadZone";

function FilesContent() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [showUpload, setShowUpload] = useState(false);
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("upload") === "1") setShowUpload(true);
  }, [params]);

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            All Files
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
            {ALL_FILES.length} files in your vault
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
            <button onClick={() => setShowUpload(false)} style={{ color: "var(--dash-text-3)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <UploadZone />
        </div>
      )}

      {/* File grid */}
      <FileGrid files={ALL_FILES} view={view} onViewChange={setView} />
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
