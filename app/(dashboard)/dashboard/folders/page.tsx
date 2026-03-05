"use client";

import { useState, Suspense } from "react";
import { FOLDERS, ALL_FILES } from "@/lib/mock-data";
import FolderCard from "@/components/dashboard/FolderCard";
import FileGrid from "@/components/dashboard/FileGrid";
import { useSearchParams } from "next/navigation";

function FoldersContent() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const params = useSearchParams();
  const activeFolderId = params.get("id");
  const activeFolder = FOLDERS.find((f) => f.id === activeFolderId);
  const folderFiles = activeFolder
    ? ALL_FILES.filter((f) => f.folder === activeFolder.name)
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
        >
          Folders
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
          {FOLDERS.length} folders
        </p>
      </div>

      {/* Folder grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {FOLDERS.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>

      {/* Folder contents panel */}
      {activeFolder && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-md flex-shrink-0"
              style={{ background: `${activeFolder.color}33`, border: `1px solid ${activeFolder.color}66` }}
            />
            <h2
              className="text-base font-semibold"
              style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
            >
              {activeFolder.name}
            </h2>
            <span className="text-xs" style={{ color: "var(--dash-text-3)" }}>
              {folderFiles.length} files
            </span>
          </div>
          {folderFiles.length > 0 ? (
            <FileGrid files={folderFiles} view={view} onViewChange={setView} />
          ) : (
            <p className="text-sm" style={{ color: "var(--dash-text-3)" }}>
              No files in this folder yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function FoldersPage() {
  return (
    <Suspense>
      <FoldersContent />
    </Suspense>
  );
}
