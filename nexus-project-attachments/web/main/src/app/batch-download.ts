import { events, invoke } from "@pc-nexus/bridge";

const EVENT = "nexus-project-attachments:batch-download:start";

export type BatchDownloadOptions = {
  projectId: string;
  attachmentIds: string[];
  name: string;
};

export type BatchDownloadTask = BatchDownloadOptions & {
  subscribeToken: string;
  jobId: string;
};

export async function createBatchDownloadTask(
  options: BatchDownloadOptions,
): Promise<BatchDownloadTask> {
  const sessionId =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const { token } = await invoke<
    { sessionId: string },
    { token: string; expiresAt: number }
  >("batch-download-sign-token", { sessionId });
  const { jobId } = await invoke("batch-download-enqueue", {
    projectId: options.projectId,
    sessionId,
    attachmentIds: options.attachmentIds,
  });
  return { ...options, subscribeToken: token, jobId };
}

export const emitBatchDownloadTask = (task: BatchDownloadTask) =>
  events.emit(EVENT, task);