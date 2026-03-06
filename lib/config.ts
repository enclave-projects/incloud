// Appwrite resource IDs — single source of truth
export const APPWRITE_DB_ID = "incloud_db";
export const APPWRITE_COLLECTION_PROFILES = "user_profiles";
export const APPWRITE_COLLECTION_FILES = "files";
export const APPWRITE_COLLECTION_FOLDERS = "folders";
export const APPWRITE_COLLECTION_TAGS = "tags";
export const APPWRITE_COLLECTION_STORAGE_META = "storage_metadata";
export const APPWRITE_COLLECTION_SETTINGS = "settings";
export const APPWRITE_BUCKET_VAULT = "vault-files";
export const APPWRITE_BUCKET_THUMBNAILS = "thumbnails";

// Storage limits
export const MAX_VAULT_CAPACITY = 42_949_672_960; // 40 GB
export const MAX_BACKUP_CAPACITY = 10_737_418_240; // 10 GB
export const MAX_UPLOAD_SIZE = 1_073_741_824; // 1 GB per file
