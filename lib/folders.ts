import { ID, Query, Permission, Role } from "appwrite";
import { databases } from "@/lib/appwrite";
import {
  APPWRITE_DB_ID,
  APPWRITE_COLLECTION_FOLDERS,
  APPWRITE_COLLECTION_FILES,
} from "@/lib/config";
import type { VaultFolder, VaultFile, FolderWithStats } from "@/lib/types";
import { withRetry } from "@/lib/retry";

/* ── Create folder ───────────────────────────────── */

export async function createFolder(
  userId: string,
  folderName: string,
  parentFolderId = "",
  parentPath = "",
  color = "#64748b"
): Promise<VaultFolder> {
  const fullPath = parentPath
    ? `${parentPath}/${folderName.replace(/\s+/g, "_")}`
    : `/${folderName.replace(/\s+/g, "_")}`;

  return withRetry(() =>
    databases.createDocument<VaultFolder>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FOLDERS,
      documentId: ID.unique(),
      data: {
        user_id: userId,
        folder_name: folderName,
        parent_folder_id: parentFolderId,
        full_path: fullPath,
        color,
        created_date: new Date().toISOString(),
      },
      permissions: [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ],
    })
  );
}

/* ── List folders ────────────────────────────────── */

export async function listFolders(
  userId: string,
  parentFolderId = ""
): Promise<VaultFolder[]> {
  const queries: string[] = [
    Query.equal("user_id", userId),
    Query.orderAsc("folder_name"),
    Query.limit(100),
  ];

  if (parentFolderId) {
    queries.push(Query.equal("parent_folder_id", parentFolderId));
  } else {
    queries.push(Query.equal("parent_folder_id", ""));
  }

  const res = await withRetry(() =>
    databases.listDocuments<VaultFolder>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FOLDERS,
      queries,
    })
  );
  return res.documents;
}

/* ── List all folders (flat) ─────────────────────── */

export async function listAllFolders(userId: string): Promise<VaultFolder[]> {
  const res = await withRetry(() =>
    databases.listDocuments<VaultFolder>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FOLDERS,
      queries: [
        Query.equal("user_id", userId),
        Query.orderAsc("folder_name"),
        Query.limit(200),
      ],
    })
  );
  return res.documents;
}

/* ── Get folder ──────────────────────────────────── */

export async function getFolder(folderId: string): Promise<VaultFolder> {
  return withRetry(() =>
    databases.getDocument<VaultFolder>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FOLDERS,
      documentId: folderId,
    })
  );
}

/* ── Update folder ───────────────────────────────── */

export async function updateFolder(
  folderId: string,
  data: Partial<{ folder_name: string; color: string }>
): Promise<VaultFolder> {
  // If folder_name changes, recompute full_path
  if (data.folder_name) {
    const current = await getFolder(folderId);
    const parentPath = current.full_path.substring(
      0,
      current.full_path.lastIndexOf("/")
    );
    const newFullPath = `${parentPath}/${data.folder_name.replace(/\s+/g, "_")}`;
    return withRetry(() =>
      databases.updateDocument<VaultFolder>({
        databaseId: APPWRITE_DB_ID,
        collectionId: APPWRITE_COLLECTION_FOLDERS,
        documentId: folderId,
        data: { ...data, full_path: newFullPath },
      })
    );
  }

  return withRetry(() =>
    databases.updateDocument<VaultFolder>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FOLDERS,
      documentId: folderId,
      data,
    })
  );
}

/* ── Delete folder ───────────────────────────────── */

export async function deleteFolder(folderId: string): Promise<void> {
  // Clear folder_id on all child files so they don't hold stale references
  const childFiles = await withRetry(() =>
    databases.listDocuments<VaultFile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FILES,
      queries: [
        Query.equal("folder_id", folderId),
        Query.select(["$id"]),
        Query.limit(500),
      ],
    })
  );

  await Promise.all(
    childFiles.documents.map((f) =>
      withRetry(() =>
        databases.updateDocument({
          databaseId: APPWRITE_DB_ID,
          collectionId: APPWRITE_COLLECTION_FILES,
          documentId: f.$id,
          data: { folder_id: "", folder_path: "/" },
        })
      )
    )
  );

  await withRetry(() =>
    databases.deleteDocument({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_FOLDERS,
      documentId: folderId,
    })
  );
}

/* ── Get folders with file stats ─────────────────── */

export async function listFoldersWithStats(
  userId: string
): Promise<FolderWithStats[]> {
  const folders = await listAllFolders(userId);

  // Fetch file counts/sizes per folder
  const withStats: FolderWithStats[] = await Promise.all(
    folders.map(async (folder) => {
      const res = await withRetry(() =>
        databases.listDocuments<VaultFile>({
          databaseId: APPWRITE_DB_ID,
          collectionId: APPWRITE_COLLECTION_FILES,
          queries: [
            Query.equal("user_id", userId),
            Query.equal("folder_id", folder.$id),
            Query.select(["file_size"]),
            Query.limit(5000),
          ],
        })
      );
      const totalSize = res.documents.reduce(
        (sum, f) => sum + (f.file_size || 0),
        0
      );
      return {
        ...folder,
        fileCount: res.total,
        totalSize,
      };
    })
  );

  return withStats;
}

/* ── Seed default folders ────────────────────────── */

const DEFAULT_FOLDERS = [
  { name: "Raw Footage", color: "#a78bfa" },
  { name: "Project Files", color: "#22d3ee" },
  { name: "Rendered Outputs", color: "#4ade80" },
  { name: "Reference Media", color: "#f472b6" },
  { name: "Textures & Assets", color: "#fb923c" },
  { name: "Sound Design", color: "#fbbf24" },
  { name: "Archive", color: "#64748b" },
];

export async function seedDefaultFolders(userId: string): Promise<VaultFolder[]> {
  const existing = await listAllFolders(userId);
  if (existing.length > 0) return existing;

  const created: VaultFolder[] = [];
  for (const def of DEFAULT_FOLDERS) {
    const folder = await createFolder(userId, def.name, "", "", def.color);
    created.push(folder);
  }
  return created;
}
