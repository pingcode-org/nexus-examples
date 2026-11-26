import type { NexusAppContext, Resolver } from "@pc-nexus/core";
import type {
  EnqueueBatchDownloadPayload,
  EnqueueBatchDownloadResult,
} from "../model/index.js";
import { batchDownloadService } from "../services/batch-download.js";

export function defineBatchDownloadFns(resolver: Resolver) {
  resolver.define<{ sessionId: string }, { token: string; expiresAt: number }>(
    "batch-download-sign-token",
    (ctx: NexusAppContext, { sessionId }) =>
      batchDownloadService.signProgressToken(ctx, sessionId),
  );

  resolver.define<EnqueueBatchDownloadPayload, EnqueueBatchDownloadResult>(
    "batch-download-enqueue",
    (ctx, payload) => batchDownloadService.enqueue(ctx, payload),
  );
}