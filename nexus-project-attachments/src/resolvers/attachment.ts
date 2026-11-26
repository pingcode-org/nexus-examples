import type { Resolver } from "@pc-nexus/core";
import type { PresignedURLToObjectKeyMap } from "@pc-nexus/storage";
import {
  type AttachmentListResult,
  type AttachmentResult,
  type ConfirmReuploadPayload,
  type ConfirmUploadPayload,
  type DeleteAttachmentPayload,
  type RenameAttachmentPayload,
  type UploadAttachmentPartPayload,
  type UploadAttachmentPartResult,
  parseConfirmReuploadPayload,
  parseConfirmUploadPayload,
  parseDeleteAttachmentPayload,
  parseRenameAttachmentPayload,
} from "../model/index.js";
import { attachmentService } from "../services/attachment.js";

export function defineAttachmentFns(resolver: Resolver) {
  resolver.define<void, AttachmentListResult>("list-attachments", async (context) =>
    attachmentService.list(context),
  );

  resolver.define<UploadAttachmentPartPayload, UploadAttachmentPartResult>(
    "attachment-upload-part",
    async (context, payload) =>
      attachmentService.uploadAttachmentPart(context, payload),
  );

  resolver.define<string[], PresignedURLToObjectKeyMap>(
    "generate-download-urls",
    async (context, payload) =>
      attachmentService.generateDownloadUrls(context, payload),
  );

  resolver.define<ConfirmUploadPayload, AttachmentResult>(
    "confirm-upload",
    async (context, payload) =>
      attachmentService.confirmUpload(
        context,
        parseConfirmUploadPayload(payload),
      ),
  );

  resolver.define<ConfirmReuploadPayload, AttachmentResult>(
    "confirm-reupload",
    async (context, payload) =>
      attachmentService.confirmReupload(
        context,
        parseConfirmReuploadPayload(payload),
      ),
  );

  resolver.define<RenameAttachmentPayload, AttachmentResult>(
    "rename-attachment",
    async (context, payload) =>
      attachmentService.rename(context, parseRenameAttachmentPayload(payload)),
  );

  resolver.define<DeleteAttachmentPayload, { ok: true }>(
    "delete-attachment",
    async (context, payload) =>
      attachmentService.delete(context, parseDeleteAttachmentPayload(payload)),
  );
}