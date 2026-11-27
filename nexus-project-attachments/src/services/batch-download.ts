import { randomUUID } from "node:crypto";
import type { ConsumerHandler } from "@pc-nexus/async";
import { queue } from "@pc-nexus/async";
import type { NexusAppContext } from "@pc-nexus/core";
import { realtime } from "@pc-nexus/realtime";
import PizZip from "pizzip";
import type {
  BatchDownloadJobFile,
  BatchDownloadJobPayload,
  EnqueueBatchDownloadPayload,
  EnqueueBatchDownloadResult,
} from "../model/index.js";
import { attachmentStorage } from "../storage.js";
import {
  assertAttachmentKey,
  createNosDownloadUrl,
  fetchNosObjectFromUrl,
  putNosObject,
} from "./nos-object.js";

const QUEUE = "batch-download";
const PROGRESS_CHANNEL = "nexus-project-attachments:batch-download:progress";

function mapProgress(done: number, total: number): number {
  return total <= 0
    ? 85
    : Math.round(10 + (75 * Math.min(done, total)) / total);
}

async function createProgressReporter(
  jobId: string,
  sessionId: string,
  userId: string,
) {
  const { token } = await realtime.signToken(
    PROGRESS_CHANNEL,
    { sessionId, userId },
    "publish",
  );
  return (
    progress: number,
    patch?: {
      status?: "running" | "done" | "error";
      fileName?: string;
      fileUrl?: string;
      fileCount?: number;
      error?: string;
    },
  ) =>
    realtime.publish(
      PROGRESS_CHANNEL,
      { jobId, progress, status: "running", ...patch },
      { scope: "token", token },
    );
}

function projectId(context: NexusAppContext): string {
  return (context.extension!.data as { project: { id: string } }).project.id;
}

export class BatchDownloadService {
  async signProgressToken(context: NexusAppContext, sessionId: string) {
    const signed = await realtime.signToken(
      PROGRESS_CHANNEL,
      { sessionId, userId: context.user!.id },
      "subscribe",
    );
    return { token: signed.token, expiresAt: signed.expires_at };
  }

  async enqueue(
    context: NexusAppContext,
    input: EnqueueBatchDownloadPayload,
  ): Promise<EnqueueBatchDownloadResult> {
    const attachmentIds = (input.attachmentIds ?? [])
      .map((id) => id.trim())
      .filter(Boolean);
    if (attachmentIds.length === 0) {
      throw new Error("当前没有可下载的附件");
    }

    const pid = input.projectId ?? projectId(context);
    const idSet = new Set(attachmentIds);
    const selected = (
      await attachmentStorage.find((b) => b.field("project_id").eq(pid))
    ).filter((row) => idSet.has(row.id));
    if (selected.length !== attachmentIds.length) {
      throw new Error("所选附件不存在或已被删除");
    }

    const files: BatchDownloadJobFile[] = await Promise.all(
      selected.map(async (row) => {
        assertAttachmentKey(row.object_key, pid);
        return {
          name: row.name,
          downloadUrl: await createNosDownloadUrl(row.object_key),
        };
      }),
    );

    const { jobId } = await queue.push(QUEUE, {
      projectId: pid,
      actorUserId: context.user!.id,
      sessionId: input.sessionId,
      files,
    } satisfies BatchDownloadJobPayload);
    return { jobId, fileCount: files.length };
  }

  async process(
    _context: NexusAppContext,
    jobId: string,
    payload: BatchDownloadJobPayload,
  ): Promise<void> {
    const report = await createProgressReporter(
      jobId,
      payload.sessionId,
      payload.actorUserId,
    );
    try {
      const files = payload.files;
      if (!files?.length) {
        throw new Error("批量下载任务缺少附件");
      }
      await report(5);
      await report(10, { fileCount: files.length });

      const zip = new PizZip();
      for (const [index, file] of files.entries()) {
        zip.file(
          file.name,
          await fetchNosObjectFromUrl(file.downloadUrl, file.name),
          { binary: true },
        );
        await report(mapProgress(index + 1, files.length));
      }

      const archive = zip.generate({
        type: "nodebuffer",
        compression: "DEFLATE",
      }) as Buffer;
      const timestamp = Date.now();
      const fileName = `项目附件-${timestamp}.zip`;
      const nosKey = `attachments/${payload.projectId}/archives/${timestamp}-${randomUUID()}.zip`;
      await putNosObject(nosKey, archive, "application/zip", fileName);

      await report(100, {
        status: "done",
        fileUrl: await createNosDownloadUrl(nosKey),
        fileName,
        fileCount: files.length,
      });
    } catch (error) {
      await report(100, {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

export const batchDownloadService = new BatchDownloadService();

export const batchDownloadConsumer: ConsumerHandler<BatchDownloadJobPayload> =
  async (context, task) => {
    await batchDownloadService.process(context, task.job_id, task.payload);
  };