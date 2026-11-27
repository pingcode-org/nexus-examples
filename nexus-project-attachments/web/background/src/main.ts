import { events, realtime } from "@pc-nexus/bridge";
import { processor } from "@pc-nexus/capabilities";

const EVENT = "nexus-project-attachments:batch-download:start";
const PROGRESS_CHANNEL = "nexus-project-attachments:batch-download:progress";

type ProgressMessage = {
  jobId: string;
  progress: number;
  status?: "running" | "done" | "error";
  fileUrl?: string;
  error?: string;
};

type BatchDownloadTask = {
  projectId: string;
  attachmentIds: string[];
  name: string;
  subscribeToken: string;
  jobId: string;
};

void events.on<BatchDownloadTask>(EVENT, (task) => {
  if (task) {
    void trackBatchDownload(task).catch(console.error);
  }
});

async function trackBatchDownload(task: BatchDownloadTask): Promise<void> {
  const processRef = await processor.add({ name: task.name });
  try {
    let settle: (outcome: ProgressMessage) => void = () => {};
    const finished = new Promise<ProgressMessage>((resolve) => {
      settle = resolve;
    });
    const subscription = await realtime.subscribe<ProgressMessage>(
      PROGRESS_CHANNEL,
      (payload) => {
        if (!payload || payload.jobId !== task.jobId) {
          return;
        }
        if (payload.status === "done" || payload.status === "error") {
          settle(payload);
        } else if (typeof payload.progress === "number") {
          processRef.setProgress(payload.progress);
        }
      },
      { scope: "token", token: task.subscribeToken },
    );

    const outcome = await finished;
    subscription.unsubscribe();

    if (outcome.status === "error" || !outcome.fileUrl) {
      processRef.error(outcome.error || "打包失败");
      return;
    }
    processRef.setProgress(100);
    processRef.complete({ fileUrl: outcome.fileUrl });
  } catch (err) {
    processRef.error(err instanceof Error ? err.message : String(err));
  }
}