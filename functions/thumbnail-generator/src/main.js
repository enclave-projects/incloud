import { Client, Databases, Storage, ID, ImageFormat, ImageGravity, Permission, Role } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

const THUMB_W = 320;
const THUMB_H = 180;

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const storage = new Storage(client);

  log(`Trigger: ${req.method} | bodyType: ${typeof req.body}`);

  // Appwrite event triggers pass body as object; HTTP triggers pass string
  let doc;
  if (typeof req.body === "string") {
    try {
      doc = JSON.parse(req.body);
    } catch {
      return res.json({ ok: false, reason: "invalid event body" });
    }
  } else if (req.body && typeof req.body === "object") {
    doc = req.body;
  } else {
    return res.json({ ok: false, reason: "empty event body" });
  }

  const { appwrite_file_id, category, $id: docId, thumbnail_file_id, user_id } = doc;

  log(`Doc: id=${docId}, category=${category}, file=${appwrite_file_id}, thumb=${thumbnail_file_id}`);

  if (thumbnail_file_id) return res.json({ ok: true, reason: "already has thumbnail" });
  if (!["image", "video"].includes(category)) return res.json({ ok: true, reason: `skipped: ${category}` });

  const VAULT_BUCKET = process.env.APPWRITE_BUCKET_VAULT;
  const THUMB_BUCKET = process.env.APPWRITE_BUCKET_THUMBNAILS;
  const DB_ID = process.env.APPWRITE_DB_ID;
  const COLLECTION_ID = process.env.APPWRITE_COLLECTION_FILES;

  try {
    log(`Processing ${category} ${appwrite_file_id} for doc ${docId}`);

    // Appwrite's getFilePreview works for both images AND videos natively
    const preview = await storage.getFilePreview(
      VAULT_BUCKET,
      appwrite_file_id,
      THUMB_W,
      THUMB_H,
      ImageGravity.Center,
      80,
      undefined, undefined, undefined, undefined, undefined, undefined,
      ImageFormat.Jpg
    );
    const thumbBuffer = Buffer.from(preview);
    log(`Preview generated: ${thumbBuffer.length} bytes`);

    // Set read permission for the file owner
    const permissions = user_id
      ? [Permission.read(Role.user(user_id))]
      : [Permission.read(Role.users())];

    const thumbFile = await storage.createFile(
      THUMB_BUCKET,
      ID.unique(),
      InputFile.fromBuffer(thumbBuffer, `${docId}-thumb.jpg`, "image/jpeg"),
      permissions
    );

    await db.updateDocument(DB_ID, COLLECTION_ID, docId, {
      thumbnail_file_id: thumbFile.$id,
    });

    log(`Done: ${thumbFile.$id} for doc ${docId}`);
    return res.json({ ok: true, thumbnailId: thumbFile.$id });

  } catch (err) {
    error(`Failed for doc ${docId}: ${err.message}`);
    return res.json({ ok: false, error: err.message });
  }
};
