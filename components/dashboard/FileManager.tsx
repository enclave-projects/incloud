"use client";

import { useState, useEffect, useCallback } from "react";
import FileGrid from "./FileGrid";
import Modal from "../ui/Modal";
import FileTypeIcon from "../ui/FileTypeIcon";
import { useAuth } from "@/lib/auth-context";
import {
  updateFile,
  deleteFile,
  toggleBackup,
  getFileDownloadUrl,
  getFileViewUrl,
} from "@/lib/files";
import { listAllFolders } from "@/lib/folders";
import { listTags, createTag, deleteTag as removeTagApi } from "@/lib/tags";
import { decrementStorage, updateBackupStats } from "@/lib/storage-stats";
import type { ParsedVaultFile, VaultFolder, VaultTag } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/format";

interface FileManagerProps {
  files: ParsedVaultFile[];
  onMutate: () => void;
  defaultView?: "grid" | "list";
  showToolbar?: boolean;
}

type ModalType = "preview" | "rename" | "move" | "tags" | "delete" | null;

const TAG_COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b",
  "#8b5cf6", "#ec4899", "#06b6d4", "#6b7280",
];

export default function FileManager({
  files,
  onMutate,
  defaultView = "grid",
  showToolbar = true,
}: FileManagerProps) {
  const { user } = useAuth();
  const [view, setView] = useState(defaultView);
  const [selected, setSelected] = useState<ParsedVaultFile | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [folders, setFolders] = useState<VaultFolder[]>([]);
  const [allTags, setAllTags] = useState<VaultTag[]>([]);
  const [loading, setLoading] = useState(false);

  const [newName, setNewName] = useState("");
  const [targetFolder, setTargetFolder] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6b7280");

  useEffect(() => {
    if (!user) return;
    listAllFolders(user.$id).then(setFolders).catch(() => {});
    listTags(user.$id).then(setAllTags).catch(() => {});
  }, [user]);

  const closeModal = useCallback(() => {
    setModal(null);
    setSelected(null);
    setLoading(false);
  }, []);

  const handleAction = useCallback(
    (action: string, file: ParsedVaultFile) => {
      setSelected(file);
      switch (action) {
        case "preview":
          setModal("preview");
          break;
        case "download":
          window.open(getFileDownloadUrl(file.appwrite_file_id), "_blank", "noopener,noreferrer");
          setSelected(null);
          break;
        case "rename":
          setNewName(file.filename);
          setModal("rename");
          break;
        case "move":
          setTargetFolder(file.folder_id);
          setModal("move");
          break;
        case "backup":
          toggleBackup(file.$id, !file.is_backup)
            .then(() => {
              if (user) {
                updateBackupStats(
                  user.$id,
                  file.is_backup ? -file.file_size : file.file_size,
                  file.is_backup ? -1 : 1
                ).catch(() => {});
              }
              onMutate();
            })
            .catch(() => {});
          setSelected(null);
          break;
        case "tags":
          setModal("tags");
          break;
        case "delete":
          setModal("delete");
          break;
      }
    },
    [user, onMutate]
  );

  const handleRename = async () => {
    if (!selected || !newName.trim()) return;
    setLoading(true);
    try {
      await updateFile(selected.$id, { filename: newName.trim() });
      onMutate();
      closeModal();
    } catch {
      setLoading(false);
    }
  };

  const handleMove = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const folder = folders.find((f) => f.$id === targetFolder);
      await updateFile(selected.$id, {
        folder_id: targetFolder,
        folder_path: folder?.full_path || "/",
      });
      onMutate();
      closeModal();
    } catch {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !user) return;
    setLoading(true);
    try {
      await deleteFile(selected.$id, selected.appwrite_file_id);
      await decrementStorage(user.$id, selected.file_size, selected.is_backup).catch(() => {});
      onMutate();
      closeModal();
    } catch {
      setLoading(false);
    }
  };

  const toggleFileTag = async (tagName: string) => {
    if (!selected) return;
    const current = [...selected.tags];
    const idx = current.indexOf(tagName);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(tagName);
    try {
      await updateFile(selected.$id, { tags: current });
      setSelected({ ...selected, tags: current });
      onMutate();
    } catch { /* ignore */ }
  };

  const handleCreateTag = async () => {
    if (!user || !newTagName.trim()) return;
    try {
      const tag = await createTag(user.$id, newTagName.trim(), newTagColor);
      setAllTags((prev) => [...prev, tag]);
      setNewTagName("");
    } catch { /* ignore */ }
  };

  const handleDeleteTag = async (tagId: string, tagName: string) => {
    try {
      await removeTagApi(tagId);
      setAllTags((prev) => prev.filter((t) => t.$id !== tagId));
      if (selected && selected.tags.includes(tagName)) {
        const updated = selected.tags.filter((t) => t !== tagName);
        await updateFile(selected.$id, { tags: updated });
        setSelected({ ...selected, tags: updated });
        onMutate();
      }
    } catch { /* ignore */ }
  };

  const previewUrl = selected ? getFileViewUrl(selected.appwrite_file_id) : "";
  const isImage = selected?.category === "image";
  const isVideo = selected?.category === "video";
  const isAudio = selected?.category === "audio";

  return (
    <>
      <FileGrid
        files={files}
        view={view}
        onViewChange={setView}
        onFileAction={handleAction}
        showToolbar={showToolbar}
      />

      {/* ── Preview Modal ── */}
      <Modal open={modal === "preview"} onClose={closeModal} title={selected?.filename || "Preview"} width={720}>
        {selected && (
          <div className="flex flex-col gap-5">
            <div
              className="rounded-xl overflow-hidden flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.3)", minHeight: 280 }}
            >
              {isImage ? (
                <img src={previewUrl} alt={selected.filename} className="max-w-full max-h-[60vh] object-contain" />
              ) : isVideo ? (
                <video src={previewUrl} controls className="max-w-full max-h-[60vh]" />
              ) : isAudio ? (
                <div className="p-8 flex flex-col items-center gap-4 w-full">
                  <FileTypeIcon category="audio" size={48} />
                  <audio src={previewUrl} controls className="w-full" />
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center gap-3">
                  <FileTypeIcon category={selected.category} size={48} />
                  <p className="text-sm" style={{ color: "var(--dash-text-3)" }}>
                    No preview available for this file type
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {([
                ["Size", formatBytes(selected.file_size)],
                ["Type", selected.mime_type || selected.extension],
                ["Uploaded", formatDate(selected.upload_date)],
                ["Category", selected.category],
                ["Folder", selected.folder_path || "/"],
                ["Backup", selected.is_backup ? "Yes" : "No"],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span style={{ color: "var(--dash-text-3)" }}>{label}:</span>
                  <span style={{ color: "var(--dash-text)" }}>{value}</span>
                </div>
              ))}
            </div>
            {selected.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selected.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--dash-accent-dim)", color: "var(--dash-accent)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <a
              href={getFileDownloadUrl(selected.appwrite_file_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "var(--dash-accent)", color: "#fff" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </a>
          </div>
        )}
      </Modal>

      {/* ── Rename Modal ── */}
      <Modal open={modal === "rename"} onClose={closeModal} title="Rename File">
        <div className="flex flex-col gap-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
            className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              background: "var(--dash-surface-2)",
              border: "1px solid var(--dash-border)",
              color: "var(--dash-text)",
            }}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ color: "var(--dash-text-2)", background: "rgba(255,255,255,0.05)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleRename}
              disabled={loading || !newName.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--dash-accent)", color: "#fff" }}
            >
              {loading ? "Saving…" : "Rename"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Move to Folder Modal ── */}
      <Modal open={modal === "move"} onClose={closeModal} title="Move to Folder">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
            <button
              onClick={() => setTargetFolder("")}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
              style={{
                background: targetFolder === "" ? "var(--dash-accent-dim)" : "transparent",
                color: targetFolder === "" ? "var(--dash-accent)" : "var(--dash-text-2)",
                border: `1px solid ${targetFolder === "" ? "rgba(59,130,246,0.3)" : "transparent"}`,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Root (no folder)
            </button>
            {folders.map((f) => (
              <button
                key={f.$id}
                onClick={() => setTargetFolder(f.$id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
                style={{
                  background: targetFolder === f.$id ? "var(--dash-accent-dim)" : "transparent",
                  color: targetFolder === f.$id ? "var(--dash-accent)" : "var(--dash-text-2)",
                  border: `1px solid ${targetFolder === f.$id ? "rgba(59,130,246,0.3)" : "transparent"}`,
                }}
              >
                <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: f.color }} />
                {f.folder_name}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2" style={{ borderTop: "1px solid var(--dash-border)" }}>
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ color: "var(--dash-text-2)", background: "rgba(255,255,255,0.05)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--dash-accent)", color: "#fff" }}
            >
              {loading ? "Moving…" : "Move"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Manage Tags Modal ── */}
      <Modal open={modal === "tags"} onClose={closeModal} title="Manage Tags">
        {selected && (
          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--dash-text-3)" }}>
                Tags on this file
              </p>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {selected.tags.length === 0 && (
                  <span className="text-xs" style={{ color: "var(--dash-text-3)" }}>No tags assigned</span>
                )}
                {selected.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleFileTag(t)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
                    style={{ background: "var(--dash-accent-dim)", color: "var(--dash-accent)" }}
                  >
                    {t}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--dash-text-3)" }}>
                Available tags
              </p>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {allTags
                  .filter((t) => !selected.tags.includes(t.tag_name))
                  .map((t) => (
                    <div key={t.$id} className="flex items-center gap-0.5">
                      <button
                        onClick={() => toggleFileTag(t.tag_name)}
                        className="text-xs px-2.5 py-1 rounded-full transition-colors hover:opacity-80"
                        style={{
                          background: `${t.color}20`,
                          color: t.color,
                          border: `1px solid ${t.color}40`,
                        }}
                      >
                        + {t.tag_name}
                      </button>
                      <button
                        onClick={() => handleDeleteTag(t.$id, t.tag_name)}
                        className="w-5 h-5 rounded flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                        style={{ color: "#ef4444" }}
                        title="Delete this tag"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                {allTags.filter((t) => !selected.tags.includes(t.tag_name)).length === 0 && (
                  <span className="text-xs" style={{ color: "var(--dash-text-3)" }}>No more tags available — create one below</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--dash-text-3)" }}>
                Create new tag
              </p>
              <div className="flex gap-2 items-center">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateTag(); }}
                  placeholder="Tag name…"
                  className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--dash-surface-2)",
                    border: "1px solid var(--dash-border)",
                    color: "var(--dash-text)",
                  }}
                />
                <div className="flex gap-1 flex-shrink-0">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewTagColor(c)}
                      aria-label={`Select color ${c}`}
                      className="w-5 h-5 rounded-full flex-shrink-0 transition-transform"
                      style={{
                        background: c,
                        transform: newTagColor === c ? "scale(1.25)" : "scale(1)",
                        outline: newTagColor === c ? "2px solid white" : "none",
                        outlineOffset: 1,
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 flex-shrink-0"
                  style={{ background: "var(--dash-accent)", color: "#fff" }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Confirmation ── */}
      <Modal open={modal === "delete"} onClose={closeModal} title="Delete File">
        <div className="flex flex-col gap-4">
          <p className="text-sm" style={{ color: "var(--dash-text-2)" }}>
            Are you sure you want to permanently delete{" "}
            <strong style={{ color: "var(--dash-text)" }}>{selected?.filename}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ color: "var(--dash-text-2)", background: "rgba(255,255,255,0.05)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "#ef4444", color: "#fff" }}
            >
              {loading ? "Deleting…" : "Delete Permanently"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
