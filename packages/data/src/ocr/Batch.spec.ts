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

/*const timestamp = (d: number) => {
  return new Date(d).toISOString().replace(/.\d+Z$/g, "Z");
};*/

const now = "2021-01-14T16:30:02Z";
const then = "2021-01-14T15:30:02Z";

const { isValid: isValidExportWaiting } = tester(ExportWaitingOcrBatch);
const { isValid: isValidExportFailed } = tester(ExportFailedOcrBatch);
const { isValid: isValidExportSucceeded } = tester(ExportSucceededOcrBatch);

const goodExportWaiting: ExportWaitingOcrBatch = {
  id: "123",
  name: "waiting-for-processing",
  priority: 1,
  canvases: ["69429/c0cj87k0gq3s"],
  staff: {
    by: USER,
    date: then,
  },
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
  name: "processing-failed",
  exportProcess: {
    requestDate: then,
    succeeded: false,
    processDate: now,
    message: "none",
  },
  staff: {
    by: USER,
    date: now,
  },
};

test(
  "Export failed batch schema parses a valid object",
  isValidExportFailed,
  goodExportFailed
);

const goodExportSucceeded: ExportSucceededOcrBatch = {
  ...goodExportWaiting,
  name: "processing-succeeded",
  exportProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Good job, everyone.",
  },
  staff: {
    by: USER,
    date: now,
  },
};

test(
  "Export succeeded batch schema parses a valid object",
  isValidExportSucceeded,
  goodExportSucceeded
);

const goodExportSucceededNoMessage: ExportSucceededOcrBatch = {
  ...goodExportWaiting,
  name: "processing-succeeded",
  exportProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
  },
  staff: {
    by: USER,
    date: now,
  },
};

test(
  "Export succeeded batch schema (with no message) parses a valid object",
  isValidExportSucceeded,
  goodExportSucceededNoMessage
);

const goodImportWaiting: ImportWaitingOcrBatch = {
  ...goodExportSucceeded,
  name: "waiting-for-processing",
  staff: {
    by: USER,
    date: now,
  },
  exportProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
  },
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
  name: "processing-failed",
  exportProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
  },
  importProcess: {
    requestDate: then,
    succeeded: false,
    processDate: now,
    message: "what went wrong",
  },
  staff: {
    by: USER,
    date: now,
  },
};

test(
  "Import failed batch schema parses a valid object",
  isValidImportFailed,
  goodImportFailed
);

const goodImportSucceeded: ImportSucceededOcrBatch = {
  ...goodImportWaiting,
  name: "processing-succeeded",
  exportProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
  },
  importProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Good job, everyone.",
  },
  staff: {
    by: USER,
    date: now,
  },
};

test(
  "Import succeeded batch schema parses a valid object",
  isValidImportSucceeded,
  goodImportSucceeded
);

const goodImportSucceededNoMessage: ImportSucceededOcrBatch = {
  ...goodImportWaiting,
  name: "processing-succeeded",
  exportProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
  },
  importProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
  },
  staff: {
    by: USER,
    date: now,
  },
};

test(
  "Import succeeded batch schema (with no message) parses a valid object",
  isValidImportSucceeded,
  goodImportSucceededNoMessage
);
