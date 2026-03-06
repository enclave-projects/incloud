import { ID, Query, Permission, Role } from "appwrite";
import { databases } from "@/lib/appwrite";
import { APPWRITE_DB_ID, APPWRITE_COLLECTION_SETTINGS } from "@/lib/config";
import type { UserSettings } from "@/lib/types";

/* ── Get or create user settings ─────────────────── */

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const res = await databases.listDocuments<UserSettings>({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_SETTINGS,
    queries: [Query.equal("user_id", userId), Query.limit(1)],
  });

  if (res.documents.length > 0) return res.documents[0];

  // Create default settings
  return databases.createDocument<UserSettings>({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_SETTINGS,
    documentId: ID.unique(),
    data: {
      user_id: userId,
      theme: "dark",
      default_view: "grid",
      auto_backup: false,
      compression: false,
      warning_threshold: 80,
      video_quality: "720p",
      show_exif: true,
      hls_threshold_mb: 500,
    },
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
    ],
  });
}

/* ── Update user settings ────────────────────────── */

export async function updateUserSettings(
  settingsId: string,
  data: Partial<Omit<UserSettings, keyof import("appwrite").Models.Document | "user_id">>
): Promise<UserSettings> {
  return databases.updateDocument<UserSettings>({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_SETTINGS,
    documentId: settingsId,
    data,
  });
}
