import { ID, Query, Permission, Role } from "appwrite";
import { databases, storage } from "@/lib/appwrite";
import {
  APPWRITE_DB_ID,
  APPWRITE_COLLECTION_FILES,
  APPWRITE_BUCKET_VAULT,
  APPWRITE_BUCKET_THUMBNAILS,
} from "@/lib/config";
import type { VaultFile, ParsedVaultFile } from "@/lib/types";
import { parseVaultFile, mimeToCategory } from "@/lib/types";
import { withRetry } from "@/lib/retry";
import { computeChecksum, verifyChecksum, type VerifyResult } from "@/lib/checksum";
import { getOrCreateResumeFileId, clearResumeFileId } from "@/lib/upload-resume";

/* ── Upload a file ───────────────────────────────── */

export async function uploadFile(
  userId: string,
  file: File,
  folderId: string,
  folderPath: string,
  tags: string[] = [],
  onProgress?: (percent: number) => void
): Promise<ParsedVaultFile> {
  // 0. Compute SHA-256 before upload so we have the original bytes
  const checksum = await computeChecksum(file).catch(() => "");

  // 1. Get a stable fileId for this file (enables TUS resume on retry)
  const { fileId } = getOrCreateResumeFileId(file);

  // 2. Upload binary to storage bucket (Appwrite auto-chunks files > 5 MB via TUS)
  const createParams: Record<string, unknown> = {
    bucketId: APPWRITE_BUCKET_VAULT,
    fileId,
    file,
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  };
  if (onProgress) {
    createParams.onProgress = (p: { progress: number }) => onProgress(p.progress);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stored: { $id: string };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stored = await (storage.createFile as any)(createParams);
  } catch (err) {
    // 409 = file was fully uploaded in a previous attempt but DB write failed.
    // Recover the existing storage file and proceed to (re)create the DB document.
    if (err && typeof err === "object" && (err as { code?: number }).code === 409) {
      stored = await storage.getFile({ bucketId: APPWRITE_BUCKET_VAULT, fileId });
    } else {
      throw err;
    }
  }

  // 2. Derive metadata
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const category = mimeToCategory(file.type, ext);
  const now = new Date().toISOString();

  // 3. Create document in files collection
  const doc = await databases.createDocument<VaultFile>({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_FILES,
    documentId: ID.unique(),
    data: {
      user_id: userId,
      filename: file.name,
      original_filename: file.name,
      file_size: file.size,
      mime_type: file.type || "application/octet-stream",
      appwrite_file_id: stored.$id,
      folder_id: folderId,
      folder_path: folderPath,
      tags: JSON.stringify(tags),
      is_backup: false,
      backup_date: "",
      upload_date: now,
      modification_date: now,
      resolution: "",
      duration: 0,
      codec: "",
      bitrate: 0,
      color_space: "",
      frame_rate: 0,
      category,
      extension: ext,
      thumbnail_file_id: "",
      checksum,
    },
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });

  // Clear resume entry — both storage upload and DB write succeeded
  clearResumeFileId(file);

  return parseVaultFile(doc);
}

/* ── List files ──────────────────────────────────── */

export async function listFiles(
  userId: string,
  opts?: {
    folderId?: string;
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDesc?: boolean;
  }
): Promise<{ files: ParsedVaultFile[]; total: number }> {
  const queries: string[] = [
    Query.equal("user_id", userId),
    Query.limit(opts?.limit ?? 50),
    Query.offset(opts?.offset ?? 0),
  ];

  if (opts?.folderId) {
    queries.push(Query.equal("folder_id", opts.folderId));
  }

  if (opts?.orderBy === "name") {
    queries.push(opts.orderDesc ? Query.orderDesc("filename") : Query.orderAsc("filename"));
  } else if (opts?.orderBy === "size") {
    queries.push(opts.orderDesc ? Query.orderDesc("file_size") : Query.orderAsc("file_size"));
  } else {
    queries.push(opts?.orderDesc === false ? Query.orderAsc("upload_date") : Query.orderDesc("upload_date"));
  }

  const res = await withRetry(() =>
    databases.listDocuments<VaultFile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FILES,
      queries,
    })
  );

  return {
    files: res.documents.map(parseVaultFile),
    total: res.total,
  };
}

/* ── List recent files ───────────────────────────── */

export async function listRecentFiles(
  userId: string,
  limit = 8
): Promise<ParsedVaultFile[]> {
  const res = await withRetry(() =>
    databases.listDocuments<VaultFile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FILES,
      queries: [
        Query.equal("user_id", userId),
        Query.orderDesc("upload_date"),
        Query.limit(limit),
      ],
    })
  );
  return res.documents.map(parseVaultFile);
}

/* ── Get single file ─────────────────────────────── */

export async function getFile(fileId: string): Promise<ParsedVaultFile> {
  const doc = await withRetry(() =>
    databases.getDocument<VaultFile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FILES,
      documentId: fileId,
    })
  );
  return parseVaultFile(doc);
}

/* ── Update file metadata ────────────────────────── */

export async function updateFile(
  fileId: string,
  data: Partial<{
    filename: string;
    tags: string[];
    folder_id: string;
    folder_path: string;
    is_backup: boolean;
    backup_date: string;
    resolution: string;
    duration: number;
    codec: string;
  }>
): Promise<ParsedVaultFile> {
  const payload: Record<string, unknown> = { ...data };
  if (data.tags !== undefined) {
    payload.tags = JSON.stringify(data.tags);
  }
  payload.modification_date = new Date().toISOString();

  const doc = await withRetry(() =>
    databases.updateDocument<VaultFile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FILES,
      documentId: fileId,
      data: payload,
    })
  );
  return parseVaultFile(doc);
}

/* ── Delete file ─────────────────────────────────── */

export async function deleteFile(fileId: string, storageFileId: string): Promise<void> {
  // Delete from storage
  try {
    await storage.deleteFile({ bucketId: APPWRITE_BUCKET_VAULT, fileId: storageFileId });
  } catch (err) {
    console.warn("[deleteFile] Storage deletion failed for", storageFileId, err);
  }
  // Delete document
  await withRetry(() =>
    databases.deleteDocument({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FILES,
      documentId: fileId,
    })
  );
}

/* ── Toggle backup status ────────────────────────── */

export async function toggleBackup(
  fileId: string,
  isBackup: boolean
): Promise<ParsedVaultFile> {
  return updateFile(fileId, {
    is_backup: isBackup,
    backup_date: isBackup ? new Date().toISOString() : undefined,
  });
}

/* ── List backup files ───────────────────────────── */

export async function listBackupFiles(
  userId: string
): Promise<{ files: ParsedVaultFile[]; total: number }> {
  const res = await withRetry(() =>
    databases.listDocuments<VaultFile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FILES,
      queries: [
        Query.equal("user_id", userId),
        Query.equal("is_backup", true),
        Query.orderDesc("backup_date"),
        Query.limit(100),
      ],
    })
  );
  return { files: res.documents.map(parseVaultFile), total: res.total };
}

/* ── Search files ────────────────────────────────── */

export async function searchFiles(
  userId: string,
  opts: {
    query?: string;
    categories?: string[];
    tags?: string[];
    folderId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ files: ParsedVaultFile[]; total: number }> {
  const queries: string[] = [
    Query.equal("user_id", userId),
    Query.limit(opts.limit ?? 50),
    Query.offset(opts.offset ?? 0),
    Query.orderDesc("upload_date"),
  ];

  if (opts.query) {
    queries.push(Query.search("filename", opts.query));
  }

  if (opts.categories && opts.categories.length > 0) {
    queries.push(Query.equal("category", opts.categories));
  }

  if (opts.folderId) {
    queries.push(Query.equal("folder_id", opts.folderId));
  }

  const res = await withRetry(() =>
    databases.listDocuments<VaultFile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FILES,
      queries,
    })
  );

  let files = res.documents.map(parseVaultFile);

  // Client-side tag filtering (tags stored as JSON string)
  if (opts.tags && opts.tags.length > 0) {
    files = files.filter((f) =>
      opts.tags!.some((t) => f.tags.includes(t))
    );
  }

  return { files, total: files.length };
}

/* ── Get file download URL ───────────────────────── */

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://appwrite.enclaveprojects.dev/v1";
const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "incloud-enclaveprojects";

export function getFileDownloadUrl(storageFileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_VAULT}/files/${storageFileId}/download?project=${APPWRITE_PROJECT}`;
}

/* ── Get file preview/view URL ───────────────────── */

export function getFileViewUrl(storageFileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_VAULT}/files/${storageFileId}/view?project=${APPWRITE_PROJECT}`;
}

/* ── Get thumbnail URL from thumbnails bucket ────── */

export function getThumbnailUrl(thumbnailFileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_THUMBNAILS}/files/${thumbnailFileId}/view?project=${APPWRITE_PROJECT}`;
}

/* ── Verify file integrity against stored checksum ── */

export async function verifyFileIntegrity(
  storageFileId: string,
  storedChecksum: string
): Promise<VerifyResult> {
  const url = getFileViewUrl(storageFileId);
  return verifyChecksum(url, storedChecksum);
}

export type { VerifyResult };
