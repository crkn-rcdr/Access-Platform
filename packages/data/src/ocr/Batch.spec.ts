import test from "ava";
import { tester } from "../testHelper.js";
import { User } from "../util/User.js";

import {
  ExportFailedOcrBatch,
  ExportSucceededOcrBatch,
  ExportWaitingOcrBatch,
  ImportFailedOcrBatch,
  ImportSucceededOcrBatch,
  ImportWaitingOcrBatch,
} from "./Batch.js";

const { isValid: isValidImportWaiting } = tester(ImportWaitingOcrBatch);
const { isValid: isValidImportFailed } = tester(ImportFailedOcrBatch);
const { isValid: isValidImportSucceeded } = tester(ImportSucceededOcrBatch);

const USER: User = { name: "User McGee", email: "mcgee@crkn.ca" };

const timestamp = (d: number) => {
  return new Date(d).toISOString().replace(/.\d+Z$/g, "Z");
};

const now = timestamp(Date.now());
const then = timestamp(Date.now() - 100);

const { isValid: isValidExportWaiting } = tester(ExportWaitingOcrBatch);
const { isValid: isValidExportFailed } = tester(ExportFailedOcrBatch);
const { isValid: isValidExportSucceeded } = tester(ExportSucceededOcrBatch);

const goodExportWaiting: ExportWaitingOcrBatch = {
  id: "waiting-for-processing",
  priority: 1,
  canvases: ["69429/c0cj87k0gq3s"],
  user: USER,
  updated: then,
  exportProcess: {
    requestDate: then,
  },
};

test(
  "Export waiting batch schema parses a valid object",
  isValidExportWaiting,
  goodExportWaiting
);

const goodExportFailed: ExportFailedOcrBatch = {
  ...goodExportWaiting,
  id: "processing-failed",
  exportProcess: {
    requestDate: then,
    succeeded: false,
    processDate: now,
    message: "none",
  },
  updated: now,
};

test(
  "Export failed batch schema parses a valid object",
  isValidExportFailed,
  goodExportFailed
);

const goodExportSucceeded: ExportSucceededOcrBatch = {
  ...goodExportWaiting,
  id: "processing-succeeded",
  exportProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Good job, everyone.",
  },
};

test(
  "Export succeeded batch schema parses a valid object",
  isValidExportSucceeded,
  goodExportSucceeded
);

const goodImportWaiting: ImportWaitingOcrBatch = {
  ...goodExportSucceeded,
  id: "waiting-for-processing",
  updated: then,
  importProcess: {
    requestDate: then,
  },
};

test(
  "Import waiting batch schema parses a valid object",
  isValidImportWaiting,
  goodImportWaiting
);

const goodImportFailed: ImportFailedOcrBatch = {
  ...goodImportWaiting,
  id: "processing-failed",
  importProcess: {
    requestDate: then,
    succeeded: false,
    processDate: now,
    message: "none",
  },
  updated: now,
};

test(
  "Import failed batch schema parses a valid object",
  isValidImportFailed,
  goodImportFailed
);

const goodImportSucceeded: ImportSucceededOcrBatch = {
  ...goodImportWaiting,
  id: "processing-succeeded",
  importProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Good job, everyone.",
  },
  updated: now,
};

test(
  "Import succeeded batch schema parses a valid object",
  isValidImportSucceeded,
  goodImportSucceeded
);

const goodImportSucceededNoMessage: ImportSucceededOcrBatch = {
  ...goodImportWaiting,
  id: "processing-succeeded",
  importProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
  },
  updated: now,
};

test(
  "Import succeeded batch schema (with no message) parses a valid object",
  isValidImportSucceeded,
  goodImportSucceededNoMessage
);
