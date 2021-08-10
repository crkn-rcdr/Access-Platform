import test from "ava";
import { tester } from "../testHelper.js";
import { User } from "../util/User.js";

import { WaitingDMDTask, FailedDMDTask, SucceededDMDTask } from "./Task.js";

const { isValid: isValidWaiting } = tester(WaitingDMDTask);
const { isValid: isValidFailed } = tester(FailedDMDTask);
const { isValid: isValidSucceeded } = tester(SucceededDMDTask);

const USER: User = { name: "User McGee", email: "mcgee@crkn.ca" };

const now = Date.now() / 1000;
const then = now - 100;

const metadataAttachment = {
  content_type: "application/octet-stream",
  revpos: 5,
  digest: "md5-YQl+v66c2vfiuI0yKK7nkA==",
  length: 66204,
  stub: true,
};

const jsonAttachment = {
  ...metadataAttachment,
  content_type: "application/json",
};

const xmlAttachment = {
  ...metadataAttachment,
  content_type: "application/xml",
};

const goodWaiting: WaitingDMDTask = {
  id: "waiting-for-processing",
  attachments: {
    metadata: metadataAttachment,
  },
  user: USER,
  mdType: "csvissueinfo",
  process: { requestDate: then },
  updated: then,
};

test(
  "WaitingDMDTask schema parses a valid object",
  isValidWaiting,
  goodWaiting
);

const goodFailed: FailedDMDTask = {
  ...goodWaiting,
  id: "processing-failed",
  process: {
    requestDate: then,
    processDate: now,
    succeeded: false,
    message: "Didn't work.",
  },
  updated: now,
};

test("FailedDMDTask schema parses a valid object", isValidFailed, goodFailed);

const goodSucceeded: SucceededDMDTask = {
  ...goodFailed,
  id: "processing-succeeded",
  attachments: {
    metadata: metadataAttachment,
    "0.json": jsonAttachment,
    "0.xml": xmlAttachment,
  },
  process: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Good job, everyone.",
  },
  items: [
    { parsed: true, id: "good.id", message: "Figured this one out" },
    { parsed: false, message: "This one not so much" },
  ],
};

test(
  "SucceededDMDTask schema parses a valid object",
  isValidSucceeded,
  goodSucceeded
);
