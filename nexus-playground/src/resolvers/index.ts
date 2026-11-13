import { Resolver } from "@pc-nexus/core";
import { defineUploadFns } from "./upload.js";
import { defineUserSelectionFns } from "./user-selection.js";

const resolver = new Resolver();

defineUserSelectionFns(resolver);
defineUploadFns(resolver);

export { resolver };
