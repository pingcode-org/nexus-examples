import { randomUUID } from "node:crypto";
import type { NexusAppContext, Resolver } from "@pc-nexus/core";
import {
  nos,
  type ChecksumType,
  type GenerateUploadUrlPayload,
  type PresignedURLToObjectMetadataMap,
} from "@pc-nexus/storage";

const KEY_PREFIX = "uploads";
const CHECKSUM_TYPES = new Set<ChecksumType>([
  "SHA1",
  "SHA256",
  "CRC32",
  "CRC32C",
]);

export function defineUploadFns(resolver: Resolver) {
  resolver.define<GenerateUploadUrlPayload[], PresignedURLToObjectMetadataMap>(
    "generate-upload-urls",
    async (context, payload) => {
      const userId = requireUserId(context);
      const items = Array.isArray(payload) ? payload : [];
      if (items.length === 0) {
        throw new Error("upload payload is required");
      }

      const map: PresignedURLToObjectMetadataMap = {};
      await Promise.all(
        items.map(async (metadata) => {
          assertMetadata(metadata);
          const key = `${KEY_PREFIX}/${userId}/${randomUUID()}`;
          const body = {
            key,
            size: metadata.size,
            checksum: metadata.checksum,
            checksum_type: metadata.checksum_type,
          };
          const presignedUrl = await nos.createUploadUrl(body, {
            overwrite: false,
          });
          map[presignedUrl.url] = body;
        }),
      );
      return map;
    },
  );

  resolver.define<string, string>("create-download-url", async (context, key) => {
    assertOwned(key, requireUserId(context));
    const downloadUrl = await nos.createDownloadUrl(key);
    return downloadUrl.url;
  });
}

function assertMetadata(
  metadata: GenerateUploadUrlPayload,
): asserts metadata is GenerateUploadUrlPayload {
  if (!metadata?.size || metadata.size <= 0) {
    throw new Error("size must be a positive number");
  }
  if (!metadata.checksum?.trim()) {
    throw new Error("checksum is required");
  }
  if (!CHECKSUM_TYPES.has(metadata.checksum_type)) {
    throw new Error("checksum_type is required");
  }
}

function assertOwned(key: string, userId: string) {
  const prefix = `${KEY_PREFIX}/${userId}/`;
  if (typeof key !== "string" || !key.startsWith(prefix)) {
    throw new Error("object key does not belong to the current user");
  }
}

function requireUserId(context: NexusAppContext): string {
  const id = context.user?.id?.trim();
  if (!id) {
    throw new Error("current user is required");
  }
  return id;
}
