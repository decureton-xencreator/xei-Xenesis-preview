import { RuntimeError } from "./errors";

const MAX_ARTIFACT_BYTES = 1_048_576;

function hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function storeArtifact(
  bucket: R2Bucket,
  tenantId: string,
  missionId: string,
  request: Request,
): Promise<{ key: string; sha256: string; size: number }> {
  const bytes = await request.arrayBuffer();
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_ARTIFACT_BYTES) {
    throw new RuntimeError("artifact_size_invalid", "Artifact size must be between 1 byte and 1 MiB.", 413);
  }
  const sha256 = hex(await crypto.subtle.digest("SHA-256", bytes));
  const key = `${tenantId}/${missionId}/${sha256}`;
  await bucket.put(key, bytes, {
    httpMetadata: { contentType: request.headers.get("content-type") ?? "application/octet-stream" },
    customMetadata: { sha256, tenantId, missionId },
  });
  return { key, sha256, size: bytes.byteLength };
}
