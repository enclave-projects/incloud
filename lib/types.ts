import type { Models } from "appwrite";

/* ── File Categories ─────────────────────────────── */

export type FileCategory =
  | "video"
  | "image"
  | "audio"
  | "3d"
  | "doc"
  | "archive"
  | "lut"
  | "unknown";

/* ── Vault File (Appwrite document) ──────────────── */

export interface VaultFile extends Models.Document {
  user_id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  appwrite_file_id: string;
  folder_id: string;
  folder_path: string;
  tags: string; // JSON stringified array
  is_backup: boolean;
  backup_date: string;
  upload_date: string;
  modification_date: string;
  resolution: string;
  duration: number;
  codec: string;
  bitrate: number;
  color_space: string;
  frame_rate: number;
  category: FileCategory;
  extension: string;
  thumbnail_file_id: string;
}

/* ── Vault Folder (Appwrite document) ────────────── */

export interface VaultFolder extends Models.Document {
  user_id: string;
  folder_name: string;
  parent_folder_id: string;
  full_path: string;
  color: string;
  created_date: string;
}

/* ── Tag (Appwrite document) ─────────────────────── */

export interface VaultTag extends Models.Document {
  user_id: string;
  tag_name: string;
  color: string;
  category: string;
  created_date: string;
}

/* ── Storage Metadata (Appwrite document) ────────── */

export interface StorageMetadata extends Models.Document {
  user_id: string;
  total_vault_size: number;
  total_backup_size: number;
  max_vault_capacity: number;
  max_backup_capacity: number;
  file_count: number;
  backup_file_count: number;
  last_updated: string;
}

/* ── User Settings (Appwrite document) ───────────── */

export interface UserSettings extends Models.Document {
  user_id: string;
  theme: string;
  default_view: string;
  auto_backup: boolean;
  compression: boolean;
  warning_threshold: number;
  video_quality: string;
  show_exif: boolean;
  hls_threshold_mb: number;
}

/* ── Computed types for UI ───────────────────────── */

export interface StorageStats {
  vaultUsed: number;
  vaultTotal: number;
  backupUsed: number;
  backupTotal: number;
  fileCount: number;
  backupFileCount: number;
}

export interface FolderWithStats extends VaultFolder {
  fileCount: number;
  totalSize: number;
}

/** Parsed VaultFile with tags as array instead of JSON string */
export interface ParsedVaultFile extends Omit<VaultFile, "tags"> {
  tags: string[];
}

/* ── Helper to parse a VaultFile from DB ─────────── */

export function parseVaultFile(doc: VaultFile): ParsedVaultFile {
  let tags: string[] = [];
  try {
    tags = JSON.parse(doc.tags || "[]");
  } catch {
    tags = [];
  }
  return { ...doc, tags };
}

/* ── MIME → FileCategory mapping ─────────────────── */

export function mimeToCategory(mime: string, ext: string): FileCategory {
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("image/")) {
    if (ext === "exr" || ext === "hdr") return "3d";
    return "image";
  }
  if (mime.startsWith("audio/")) return "audio";
  if (["blend", "obj", "fbx", "abc", "glb", "gltf"].includes(ext)) return "3d";
  if (["cube", "3dl", "look"].includes(ext)) return "lut";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  if (["aep", "drp", "prproj", "nk", "hip"].includes(ext)) return "doc";
  return "unknown";
}
