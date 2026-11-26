import { Resolver } from "@pc-nexus/core";
import { defineAttachmentFns } from "./attachment.js";
import { defineBatchDownloadFns } from "./batch-download.js";

const resolver = new Resolver();

defineAttachmentFns(resolver);
defineBatchDownloadFns(resolver);

export { resolver };
