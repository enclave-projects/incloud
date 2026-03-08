import { Client, Databases, Storage, InputFile, ID } from "node-appwrite";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";

ffmpeg.setFfmpegPath(ffmpegPath);

const THUMB_W = 320;
const THUMB_H = 180;

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  const db = new Databases(client);
  const storage = new Storage(client);

  // Parse the trigger event payload
  let doc;
  try {
    doc = JSON.parse(req.body);
  } catch {
    return res.json({ ok: false, reason: "invalid event body" });
  }

  const {
    appwrite_file_id,
    category,
    $id: docId,
    thumbnail_file_id,
  } = doc;

  // Skip non-image/video and already-processed files
  if (thumbnail_file_id) {
    return res.json({ ok: true, reason: "already has thumbnail" });
  }
  if (!["image", "video"].includes(category)) {
    return res.json({ ok: true, reason: `skipped category: ${category}` });
  }

  const VAULT_BUCKET = process.env.APPWRITE_BUCKET_VAULT;
  const THUMB_BUCKET = process.env.APPWRITE_BUCKET_THUMBNAILS;
  const DB_ID = process.env.APPWRITE_DB_ID;
  const COLLECTION_ID = process.env.APPWRITE_COLLECTION_FILES;

  let inputPath = null;
  let outputPath = null;

  try {
    // Download original file from vault bucket
    log(`Downloading file ${appwrite_file_id} for doc ${docId}`);
    const fileResponse = await storage.getFileDownload(VAULT_BUCKET, appwrite_file_id);
    const buffer = Buffer.from(await fileResponse.arrayBuffer());

    let thumbBuffer;

    if (category === "image") {
      // Use sharp to resize image preserving aspect ratio
      thumbBuffer = await sharp(buffer)
        .resize(THUMB_W, THUMB_H, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      log(`Image resized: ${buffer.length} bytes → ${thumbBuffer.length} bytes`);
    } else {
      // Video: write to /tmp, extract frame at 1s, read JPEG output
      inputPath = `/tmp/${docId}-input`;
      outputPath = `/tmp/${docId}-thumb.jpg`;
      writeFileSync(inputPath, buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .seekInput(1)
          .frames(1)
          .size(`${THUMB_W}x${THUMB_H}`)
          .output(outputPath)
          .on("end", resolve)
          .on("error", (err) => {
            // If 1s seek fails (video shorter than 1s), try from the start
            ffmpeg(inputPath)
              .seekInput(0)
              .frames(1)
              .size(`${THUMB_W}x${THUMB_H}`)
              .output(outputPath)
              .on("end", resolve)
              .on("error", reject)
              .run();
          })
          .run();
      });

      thumbBuffer = readFileSync(outputPath);
      log(`Video frame extracted: ${thumbBuffer.length} bytes`);
    }

    // Upload thumbnail to thumbnails bucket
    const thumbFile = await storage.createFile(
      THUMB_BUCKET,
      ID.unique(),
      InputFile.fromBuffer(thumbBuffer, `${docId}-thumb.jpg`, "image/jpeg")
    );

    // Update file document with thumbnail_file_id
    await db.updateDocument(DB_ID, COLLECTION_ID, docId, {
      thumbnail_file_id: thumbFile.$id,
    });

    log(`Thumbnail created for doc ${docId}: ${thumbFile.$id}`);
    return res.json({ ok: true, thumbnailId: thumbFile.$id });

  } catch (err) {
    error(`Thumbnail failed for doc ${docId}: ${err.message}`);
    return res.json({ ok: false, error: err.message });
  } finally {
    // Clean up temp files
    if (inputPath && existsSync(inputPath)) unlinkSync(inputPath);
    if (outputPath && existsSync(outputPath)) unlinkSync(outputPath);
  }
};
