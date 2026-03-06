import { ID, Query, Permission, Role } from "appwrite";
import { databases } from "@/lib/appwrite";
import { APPWRITE_DB_ID, APPWRITE_COLLECTION_TAGS } from "@/lib/config";
import type { VaultTag } from "@/lib/types";

/* ── Create tag ──────────────────────────────────── */

export async function createTag(
  userId: string,
  tagName: string,
  color = "#6b7280",
  category = ""
): Promise<VaultTag> {
  return databases.createDocument<VaultTag>({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_TAGS,
    documentId: ID.unique(),
    data: {
      user_id: userId,
      tag_name: tagName,
      color,
      category,
      created_date: new Date().toISOString(),
    },
    permissions: [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  });
}

/* ── List all tags ───────────────────────────────── */

export async function listTags(userId: string): Promise<VaultTag[]> {
  const res = await databases.listDocuments<VaultTag>({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_TAGS,
    queries: [
      Query.equal("user_id", userId),
      Query.orderAsc("tag_name"),
      Query.limit(200),
    ],
  });
  return res.documents;
}

/* ── Update tag ──────────────────────────────────── */

export async function updateTag(
  tagId: string,
  data: Partial<{ tag_name: string; color: string; category: string }>
): Promise<VaultTag> {
  return databases.updateDocument<VaultTag>({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_TAGS,
    documentId: tagId,
    data,
  });
}

/* ── Delete tag ──────────────────────────────────── */

export async function deleteTag(tagId: string): Promise<void> {
  await databases.deleteDocument({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_TAGS,
    documentId: tagId,
  });
}

/* ── Seed default tags ───────────────────────────── */

const DEFAULT_TAGS = [
  { name: "in-progress", color: "#3b82f6", category: "status" },
  { name: "final", color: "#22c55e", category: "status" },
  { name: "archived", color: "#6b7280", category: "status" },
  { name: "review", color: "#f59e0b", category: "status" },
  { name: "vfx-shot", color: "#8b5cf6", category: "type" },
  { name: "matte-painting", color: "#a78bfa", category: "type" },
  { name: "motion-graphics", color: "#06b6d4", category: "type" },
  { name: "color-grade", color: "#ec4899", category: "type" },
  { name: "4K", color: "#10b981", category: "quality" },
  { name: "1080p", color: "#14b8a6", category: "quality" },
  { name: "proxy", color: "#94a3b8", category: "quality" },
  { name: "full-resolution", color: "#059669", category: "quality" },
  { name: "ProRes", color: "#f97316", category: "format" },
  { name: "DNxHD", color: "#fb923c", category: "format" },
  { name: "H264", color: "#fbbf24", category: "format" },
  { name: "project-atlas", color: "#6366f1", category: "project" },
  { name: "project-nova", color: "#8b5cf6", category: "project" },
  { name: "personal", color: "#ec4899", category: "project" },
];

export async function seedDefaultTags(userId: string): Promise<VaultTag[]> {
  const existing = await listTags(userId);
  if (existing.length > 0) return existing;

  const created: VaultTag[] = [];
  for (const def of DEFAULT_TAGS) {
    try {
      const tag = await createTag(userId, def.name, def.color, def.category);
      created.push(tag);
    } catch {
      // Duplicate tag, skip
    }
  }
  return created;
}
