import { ID, Query, Permission, Role } from "appwrite";
import { databases } from "@/lib/appwrite";
import {
  APPWRITE_DB_ID,
  APPWRITE_COLLECTION_STORAGE_META,
  APPWRITE_COLLECTION_FILES,
  MAX_VAULT_CAPACITY,
  MAX_BACKUP_CAPACITY,
} from "@/lib/config";
import type { StorageMetadata, StorageStats, VaultFile } from "@/lib/types";
import { withRetry } from "@/lib/retry";

/* ── Get or create storage metadata ──────────────── */

export async function getStorageMetadata(
  userId: string
): Promise<StorageMetadata> {
  const res = await withRetry(() =>
    databases.listDocuments<StorageMetadata>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_STORAGE_META,
      queries: [Query.equal("user_id", userId), Query.limit(1)],
    })
  );

  if (res.documents.length > 0) return res.documents[0];

  // Create initial metadata document
  return withRetry(() =>
    databases.createDocument<StorageMetadata>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_STORAGE_META,
      documentId: ID.unique(),
      data: {
        user_id: userId,
        total_vault_size: 0,
        total_backup_size: 0,
        max_vault_capacity: MAX_VAULT_CAPACITY,
        max_backup_capacity: MAX_BACKUP_CAPACITY,
        file_count: 0,
        backup_file_count: 0,
        last_updated: new Date().toISOString(),
      },
      permissions: [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
      ],
    })
  );
}

/* ── Get storage stats (formatted) ───────────────── */

export async function getStorageStats(userId: string): Promise<StorageStats> {
  const meta = await getStorageMetadata(userId);
  return {
    vaultUsed: meta.total_vault_size,
    vaultTotal: meta.max_vault_capacity,
    backupUsed: meta.total_backup_size,
    backupTotal: meta.max_backup_capacity,
    fileCount: meta.file_count,
    backupFileCount: meta.backup_file_count,
  };
}

/* ── Recalculate storage from files ──────────────── */

export async function recalculateStorage(userId: string): Promise<StorageStats> {
  // Fetch all files
  let allFiles: VaultFile[] = [];
  let offset = 0;
  const batchSize = 100;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await withRetry(() =>
      databases.listDocuments<VaultFile>({
        databaseId: APPWRITE_DB_ID,
        collectionId: APPWRITE_COLLECTION_FILES,
        queries: [
          Query.equal("user_id", userId),
          Query.select(["file_size", "is_backup"]),
          Query.limit(batchSize),
          Query.offset(offset),
        ],
      })
    );
    allFiles = allFiles.concat(res.documents);
    if (res.documents.length < batchSize) break;
    offset += batchSize;
  }

  const totalVaultSize = allFiles.reduce((sum, f) => sum + (f.file_size || 0), 0);
  const backupFiles = allFiles.filter((f) => f.is_backup);
  const totalBackupSize = backupFiles.reduce((sum, f) => sum + (f.file_size || 0), 0);

  // Update metadata
  const meta = await getStorageMetadata(userId);
  await withRetry(() =>
    databases.updateDocument({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_STORAGE_META,
      documentId: meta.$id,
      data: {
        total_vault_size: totalVaultSize,
        total_backup_size: totalBackupSize,
        file_count: allFiles.length,
        backup_file_count: backupFiles.length,
        last_updated: new Date().toISOString(),
      },
    })
  );

  return {
    vaultUsed: totalVaultSize,
    vaultTotal: meta.max_vault_capacity,
    backupUsed: totalBackupSize,
    backupTotal: meta.max_backup_capacity,
    fileCount: allFiles.length,
    backupFileCount: backupFiles.length,
  };
}

/* ── Increment storage on upload ─────────────────── */

export async function incrementStorage(
  userId: string,
  fileSize: number
): Promise<void> {
  const meta = await getStorageMetadata(userId);
  await withRetry(() =>
    databases.updateDocument({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_STORAGE_META,
      documentId: meta.$id,
      data: {
        total_vault_size: meta.total_vault_size + fileSize,
        file_count: meta.file_count + 1,
        last_updated: new Date().toISOString(),
      },
    })
  );
}

/* ── Decrement storage on delete ─────────────────── */

export async function decrementStorage(
  userId: string,
  fileSize: number,
  wasBackup: boolean
): Promise<void> {
  const meta = await getStorageMetadata(userId);
  const updates: Record<string, unknown> = {
    total_vault_size: Math.max(0, meta.total_vault_size - fileSize),
    file_count: Math.max(0, meta.file_count - 1),
    last_updated: new Date().toISOString(),
  };
  if (wasBackup) {
    updates.total_backup_size = Math.max(0, meta.total_backup_size - fileSize);
    updates.backup_file_count = Math.max(0, meta.backup_file_count - 1);
  }
  await withRetry(() =>
    databases.updateDocument({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_STORAGE_META,
      documentId: meta.$id,
      data: updates,
    })
  );
}

/* ── Update backup stats ─────────────────────────── */

export async function updateBackupStats(
  userId: string,
  fileSizeDelta: number, // positive = adding, negative = removing
  countDelta: number
): Promise<void> {
  const meta = await getStorageMetadata(userId);
  await withRetry(() =>
    databases.updateDocument({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_STORAGE_META,
      documentId: meta.$id,
      data: {
        total_backup_size: Math.max(0, meta.total_backup_size + fileSizeDelta),
        backup_file_count: Math.max(0, meta.backup_file_count + countDelta),
        last_updated: new Date().toISOString(),
      },
    })
  );
}
