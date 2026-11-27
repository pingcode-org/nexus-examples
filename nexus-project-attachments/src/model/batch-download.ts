export interface EnqueueBatchDownloadPayload {
  projectId?: string;
  sessionId: string;
  attachmentIds: string[];
}

export interface EnqueueBatchDownloadResult {
  jobId: string;
  fileCount: number;
}

export interface BatchDownloadJobFile {
  name: string;
  downloadUrl: string;
}

export interface BatchDownloadJobPayload {
  projectId: string;
  actorUserId: string;
  sessionId: string;
  files: BatchDownloadJobFile[];
}