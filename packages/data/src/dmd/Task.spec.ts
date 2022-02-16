import test from "ava";
import { tester } from "../testHelper.js";
import { User } from "../util/User.js";

import { ValidatingDMDTask, FailedDMDTask, SucceededDMDTask } from "./Task.js";

const { isValid: isValidWaiting } = tester(ValidatingDMDTask);
const { isValid: isValidFailed } = tester(FailedDMDTask);
const { isValid: isValidSucceeded, isInvalid: isInvalidSucceeded } =
  tester(SucceededDMDTask);

const USER: User = { name: "User McGee", email: "mcgee@crkn.ca" };

const timestamp = (d: number) => {
  return new Date(d).toISOString().replace(/.\d+Z$/g, "Z");
};

const now = timestamp(Date.now());
const then = timestamp(Date.now() - 100);

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

const goodWaiting: ValidatingDMDTask = {
  id: "waiting-for-processing",
  attachments: {
    metadata: metadataAttachment,
  },
  user: USER,
  format: "csvissueinfo",
  process: { requestDate: then },
  updated: then,
};

test(
  "ValidatingDMDTask schema parses a valid object",
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
    {
      parsed: true,
      output: "issueinfo",
      id: "good.id",
      label: "nice label",
      message: "Figured this one out",
    },
    { parsed: false, message: "This one not so much" },
  ],
};

test(
  "SucceededDMDTask schema parses a valid object",
  isValidSucceeded,
  goodSucceeded
);

const itemWithout = (field: "id" | "output" | "label") => {
  const goodItem = {
    parsed: true,
    output: "issueinfo",
    id: "good.id",
    label: "nice label",
    message: "Figured this one out",
  };

  const badItem = Object.assign({}, goodItem);
  delete badItem[field];
  badItem.message = `No ${field}, though!`;

  return {
    ...goodSucceeded,
    items: [goodItem, badItem],
  };
};

test(
  "SucceededDMDTask schema does not parse when a parsed item lacks an id",
  isInvalidSucceeded,
  itemWithout("id")
);

test(
  "SucceededDMDTask schema does not parse when a parsed item lacks an output",
  isInvalidSucceeded,
  itemWithout("output")
);

test(
  "SucceededDMDTask schema does not parse when a parsed item lacks a label",
  isInvalidSucceeded,
  itemWithout("label")
);
