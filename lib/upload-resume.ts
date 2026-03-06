/**
 * Resumable upload registry using localStorage.
 *
 * How it works:
 * 1. Before uploading, call `getOrCreateResumeFileId(file)` to get a stable Appwrite fileId.
 * 2. On the first attempt a new ID is generated and saved.
 * 3. If the upload is interrupted and retried, the same fileId is returned.
 * 4. Appwrite's TUS implementation uses the fileId to resume from the last chunk.
 * 5. Once the full upload + DB write succeed, call `clearResumeFileId(file)`.
 */

import { ID } from "appwrite";

const PREFIX = "incloud_upload_";
const STALE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface ResumeEntry {
  fileId: string;
  createdAt: number;
}

/** Unique, stable key per file based on name + size + lastModified. */
function storageKey(file: File): string {
  return `${PREFIX}${file.name}__${file.size}__${file.lastModified}`;
}

/**
 * Returns an existing fileId for this file (resume) or generates + saves a new one.
 * Also returns whether the upload is being resumed.
 */
export function getOrCreateResumeFileId(file: File): { fileId: string; isResuming: boolean } {
  if (typeof window === "undefined") {
    return { fileId: ID.unique(), isResuming: false };
  }

  const key = storageKey(file);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const entry: ResumeEntry = JSON.parse(raw);
      // Treat stale entries as new uploads
      if (Date.now() - entry.createdAt <= STALE_MS) {
        return { fileId: entry.fileId, isResuming: true };
      }
      localStorage.removeItem(key);
    }
  } catch {
    // corrupted entry — ignore and create fresh
  }

  const fileId = ID.unique();
  try {
    const entry: ResumeEntry = { fileId, createdAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — non-critical, upload will still work
  }
  return { fileId, isResuming: false };
}

/** Returns true if a resume entry exists for this file. */
export function hasResumeEntry(file: File): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(storageKey(file));
    if (!raw) return false;
    const entry: ResumeEntry = JSON.parse(raw);
    return Date.now() - entry.createdAt <= STALE_MS;
  } catch {
    return false;
  }
}

/** Remove the resume entry once an upload fully succeeds. */
export function clearResumeFileId(file: File): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(storageKey(file));
  } catch {
    // ignore
  }
}

/** Purge all entries older than 7 days. Call once on app init. */
export function cleanupStaleResumeEntries(): void {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PREFIX)) continue;
      try {
        const entry: ResumeEntry = JSON.parse(localStorage.getItem(key) ?? "{}");
        if (Date.now() - (entry.createdAt ?? 0) > STALE_MS) toRemove.push(key);
      } catch {
        toRemove.push(key!);
      }
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
