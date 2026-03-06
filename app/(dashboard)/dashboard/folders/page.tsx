"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { listFoldersWithStats, createFolder, deleteFolder, updateFolder } from "@/lib/folders";
import { listFiles } from "@/lib/files";
import type { FolderWithStats, ParsedVaultFile } from "@/lib/types";
import FolderCard from "@/components/dashboard/FolderCard";
import FileManager from "@/components/dashboard/FileManager";
import Modal from "@/components/ui/Modal";
import { useSearchParams } from "next/navigation";

const FOLDER_COLORS = [
  "#a78bfa", "#22d3ee", "#4ade80", "#f472b6",
  "#fb923c", "#fbbf24", "#64748b", "#3b82f6",
  "#ef4444", "#8b5cf6", "#06b6d4", "#10b981",
];

function FoldersContent() {
  const params = useSearchParams();
  const { user } = useAuth();
  const [folders, setFolders] = useState<FolderWithStats[]>([]);
  const [folderFiles, setFolderFiles] = useState<ParsedVaultFile[]>([]);

  const [showCreate, setShowCreate] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#a78bfa");
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<FolderWithStats | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeFolderId = params.get("id");
  const activeFolder = folders.find((f) => f.$id === activeFolderId);

  const fetchFolders = useCallback(() => {
    if (!user) return;
    listFoldersWithStats(user.$id).then(setFolders).catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const fetchFolderFiles = useCallback(() => {
    if (!user || !activeFolderId) { setFolderFiles([]); return; }
    listFiles(user.$id, { folderId: activeFolderId, limit: 100 })
      .then((res) => setFolderFiles(res.files))
      .catch(() => {});
  }, [user, activeFolderId]);

  useEffect(() => {
    fetchFolderFiles();
  }, [fetchFolderFiles]);

  const handleCreate = async () => {
    if (!user || !newFolderName.trim()) return;
    setCreating(true);
    try {
      await createFolder(user.$id, newFolderName.trim(), "", "", newFolderColor);
      setNewFolderName("");
      setShowCreate(false);
      fetchFolders();
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFolder(deleteTarget.$id);
      setDeleteTarget(null);
      fetchFolders();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            Folders
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
            {folders.length} folders
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--dash-accent)", color: "#fff" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Folder
        </button>
      </div>

      {/* Folder grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {folders.map((folder) => (
          <FolderCard
            key={folder.$id}
            folder={folder}
            onDelete={() => setDeleteTarget(folder)}
          />
        ))}
        {folders.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 gap-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="var(--dash-text-3)" strokeWidth="1.5" strokeLinecap="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <p className="text-sm" style={{ color: "var(--dash-text-3)" }}>
              No folders yet. Create your first folder to organize files.
            </p>
          </div>
        )}
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
              {activeFolder.folder_name}
            </h2>
            <span className="text-xs" style={{ color: "var(--dash-text-3)" }}>
              {folderFiles.length} files
            </span>
          </div>
          {folderFiles.length > 0 ? (
            <FileManager files={folderFiles} onMutate={() => { fetchFolderFiles(); fetchFolders(); }} />
          ) : (
            <p className="text-sm" style={{ color: "var(--dash-text-3)" }}>
              No files in this folder yet.
            </p>
          )}
        </div>
      )}

      {/* ── Create Folder Modal ── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Folder">
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--dash-text-3)" }}>
              Folder Name
            </label>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="My Folder"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: "var(--dash-surface-2)",
                border: "1px solid var(--dash-border)",
                color: "var(--dash-text)",
              }}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--dash-text-3)" }}>
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setNewFolderColor(c)}
                  aria-label={`Select color ${c}`}
                  className="w-7 h-7 rounded-lg flex-shrink-0 transition-transform"
                  style={{
                    background: c,
                    transform: newFolderColor === c ? "scale(1.2)" : "scale(1)",
                    outline: newFolderColor === c ? "2px solid white" : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ color: "var(--dash-text-2)", background: "rgba(255,255,255,0.05)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !newFolderName.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--dash-accent)", color: "#fff" }}
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Folder Confirm ── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Folder"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--dash-text-2)" }}>
            Are you sure you want to delete{" "}
            <strong style={{ color: "var(--dash-text)" }}>{deleteTarget?.folder_name}</strong>?
            Files inside won&apos;t be deleted, but they will no longer be associated with this folder.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ color: "var(--dash-text-2)", background: "rgba(255,255,255,0.05)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
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
