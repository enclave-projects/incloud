import { Client, Databases, Storage, ID } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import Jimp from "jimp";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { execFileSync } from "child_process";

const THUMB_W = 320;
const THUMB_H = 180;

function extractVideoFrame(inputPath, outputPath, seekSeconds) {
  const args = [
    "-y",
    "-ss", String(seekSeconds),
    "-i", inputPath,
    "-vframes", "1",
    "-vf", `scale=${THUMB_W}:${THUMB_H}:force_original_aspect_ratio=decrease`,
    outputPath,
  ];
  execFileSync("ffmpeg", args, { timeout: 30000, stdio: "pipe" });
}

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const storage = new Storage(client);

  let doc;
  try {
    doc = JSON.parse(req.body);
  } catch {
    return res.json({ ok: false, reason: "invalid event body" });
  }

  const { appwrite_file_id, category, $id: docId, thumbnail_file_id } = doc;

  if (thumbnail_file_id) return res.json({ ok: true, reason: "already has thumbnail" });
  if (!["image", "video"].includes(category)) return res.json({ ok: true, reason: `skipped: ${category}` });

  const VAULT_BUCKET = process.env.APPWRITE_BUCKET_VAULT;
  const THUMB_BUCKET = process.env.APPWRITE_BUCKET_THUMBNAILS;
  const DB_ID = process.env.APPWRITE_DB_ID;
  const COLLECTION_ID = process.env.APPWRITE_COLLECTION_FILES;

  // Use safe temp paths (docId from Appwrite is alphanumeric only)
  const inputPath = `/tmp/in-${docId}`;
  const outputPath = `/tmp/out-${docId}.jpg`;

  try {
    log(`Processing ${category} ${appwrite_file_id} for doc ${docId}`);
    const fileResponse = await storage.getFileDownload(VAULT_BUCKET, appwrite_file_id);
    const buffer = Buffer.from(await fileResponse.arrayBuffer());

    let thumbBuffer;

    if (category === "image") {
      const image = await Jimp.read(buffer);
      image.resize(THUMB_W, THUMB_H, Jimp.RESIZE_INSIDE);
      thumbBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
      log(`Image resized: ${buffer.length} → ${thumbBuffer.length} bytes`);
    } else {
      writeFileSync(inputPath, buffer);
      try {
        extractVideoFrame(inputPath, outputPath, 1);
      } catch {
        extractVideoFrame(inputPath, outputPath, 0);
      }
      thumbBuffer = readFileSync(outputPath);
      log(`Video frame extracted: ${thumbBuffer.length} bytes`);
    }

    const thumbFile = await storage.createFile(
      THUMB_BUCKET,
      ID.unique(),
      InputFile.fromBuffer(thumbBuffer, `${docId}-thumb.jpg`, "image/jpeg")
    );

    await db.updateDocument(DB_ID, COLLECTION_ID, docId, {
      thumbnail_file_id: thumbFile.$id,
    });

    log(`Done: ${thumbFile.$id} for doc ${docId}`);
    return res.json({ ok: true, thumbnailId: thumbFile.$id });

  } catch (err) {
    error(`Failed for doc ${docId}: ${err.message}`);
    return res.json({ ok: false, error: err.message });
  } finally {
    if (existsSync(inputPath)) unlinkSync(inputPath);
    if (existsSync(outputPath)) unlinkSync(outputPath);
  }
};
