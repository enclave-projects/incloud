/**
 * File integrity helpers using the Web Crypto API (SHA-256).
 * No external dependencies — works in all modern browsers.
 */

/** Converts an ArrayBuffer of hash bytes to a lowercase hex string. */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Compute the SHA-256 checksum of a File object.
 * Call this BEFORE uploading so you have the original bytes.
 */
export async function computeChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return bufferToHex(hashBuffer);
}

/**
 * Compute the SHA-256 checksum of an already-downloaded ArrayBuffer.
 */
export async function computeChecksumFromBuffer(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return bufferToHex(hashBuffer);
}

export type VerifyResult = "verified" | "mismatch" | "error";

/**
 * Fetches the file from `fileUrl` and compares its SHA-256 against `storedChecksum`.
 *
 * - "verified"  → checksums match, file is intact
 * - "mismatch"  → checksums differ, file may be corrupted
 * - "error"     → could not fetch / compute (network error, CORS, etc.)
 */
export async function verifyChecksum(
  fileUrl: string,
  storedChecksum: string
): Promise<VerifyResult> {
  try {
    const response = await fetch(fileUrl, { credentials: "include" });
    if (!response.ok) return "error";
    const buffer = await response.arrayBuffer();
    const computed = await computeChecksumFromBuffer(buffer);
    return computed === storedChecksum ? "verified" : "mismatch";
  } catch {
    return "error";
  }
}

/** Returns a short, human-readable display form of a hex checksum. */
export function shortChecksum(hex: string): string {
  if (!hex || hex.length < 16) return hex;
  return `${hex.slice(0, 8)}…${hex.slice(-6)}`;
}
