import { createHash } from "node:crypto";
import { fetch as nexusFetch } from "@pc-nexus/network";
import { nos } from "@pc-nexus/storage";

export function sha256Base64(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("base64");
}

export function preSignedUrl(
  result: string | { url: string },
  label: string,
): string {
  const url = typeof result === "string" ? result : result.url;
  if (!url) {
    throw new Error(`${label}为空`);
  }
  return url;
}

export function assertAttachmentKey(objectKey: string, projectId: string): void {
  const prefix = `attachments/${projectId}/`;
  if (!objectKey.startsWith(prefix)) {
    throw new Error(`对象键不属于当前项目：${objectKey}`);
  }
}

export async function fetchNosObjectFromUrl(
  url: string,
  key: string,
): Promise<Buffer> {
  const response = await nexusFetch.request(url, { method: "GET" });
  if (!response.ok) {
    throw new Error(`下载附件失败（${key}）：HTTP ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

export async function putNosObject(
  key: string,
  buffer: Buffer,
  contentType: string,
  fileName: string,
): Promise<void> {
  const body = {
    key,
    size: buffer.byteLength,
    checksum: sha256Base64(buffer),
    checksum_type: "SHA256" as const,
  };
  const url = preSignedUrl(await nos.createUploadUrl(body, { overwrite: false }), "上传地址");
  const form = new FormData();
  form.append(
    "file",
    new Blob([new Uint8Array(buffer)], { type: contentType }),
    fileName,
  );
  const response = await nexusFetch.request(url, { method: "PUT", body: form });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`上传对象失败：${response.status} ${text}`);
  }
  await nos.getMetadata(key);
}

export async function createNosDownloadUrl(key: string): Promise<string> {
  return preSignedUrl(await nos.createDownloadUrl(key), "下载地址");
}

export async function readNosObject(key: string): Promise<Buffer> {
  return fetchNosObjectFromUrl(await createNosDownloadUrl(key), key);
}