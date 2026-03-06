/**
 * One-time script: Update vault-files bucket to allow ALL file types
 * and set maxFileSize to 1 GB.
 *
 * Run:  APPWRITE_API_KEY=your_key node scripts/update-bucket.mjs
 *
 * NOTE: The Appwrite server env var _APP_STORAGE_LIMIT must also be
 *       set to at least 1073741824 (1 GB) in your docker-compose or
 *       .env for this to take full effect.
 */
import { Client, Storage } from "node-appwrite";

if (!process.env.APPWRITE_API_KEY) {
  console.error("❌ APPWRITE_API_KEY env var is required.");
  console.error("   Usage: APPWRITE_API_KEY=your_key node scripts/update-bucket.mjs");
  process.exit(1);
}

const client = new Client()
  .setEndpoint("https://appwrite.enclaveprojects.dev/v1")
  .setProject("incloud-enclaveprojects")
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

const BUCKET_ID = "vault-files";
const MAX_SIZE = 1_073_741_824; // 1 GB

async function main() {
  try {
    const bucket = await storage.updateBucket(
      BUCKET_ID,
      BUCKET_ID,               // name (keep same)
      undefined,               // permissions — keep existing
      false,                   // fileSecurity
      true,                    // enabled
      MAX_SIZE,                // maximumFileSize → 1 GB
      [],                      // allowedFileExtensions — empty = allow ALL
      undefined,               // compression
      undefined,               // encryption
      undefined                // antivirus
    );

    console.log("✅ Bucket updated successfully");
    console.log("   Name:", bucket.name);
    console.log("   Max file size:", bucket.maximumFileSize, "bytes (" + (bucket.maximumFileSize / (1024*1024)).toFixed(0) + " MB)");
    console.log("   Allowed extensions:", bucket.allowedFileExtensions.length === 0 ? "ALL" : bucket.allowedFileExtensions.join(", "));
  } catch (err) {
    console.error("❌ Failed to update bucket:", err.message || err);
    process.exit(1);
  }
}

main();
