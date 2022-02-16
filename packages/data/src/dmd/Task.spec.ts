import test from "ava";
import { tester } from "../testHelper.js";
import { User } from "../util/User.js";

import {
  ValidatingDMDTask,
  FailedDMDTask,
  SucceededDMDTask,
  QueuedDMDTask,
  ValidatedDMDTask,
} from "./Task.js";

const { isValid: isValidValidating, isInvalid: isInvalidValidating } =
  tester(ValidatingDMDTask);
const { isValid: isValidValidated, isInvalid: isInvalidValidated } =
  tester(ValidatedDMDTask);
const { isValid: isValidQueued, isInvalid: isInvalidQueued } =
  tester(QueuedDMDTask);
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

const goodValidating: ValidatingDMDTask = {
  id: "waiting-for-processing",
  attachments: {
    metadata: metadataAttachment,
  },
  user: USER,
  format: "csvissueinfo",
  validationProcess: { requestDate: then },
  updated: then,
};

test(
  "ValidatingDMDTask schema parses a valid object",
  isValidValidating,
  goodValidating
);

test(
  "ValidatingDMDTask schema does not parse as Validated",
  isInvalidValidated,
  goodValidating
);

const goodValidated: ValidatedDMDTask = {
  ...goodValidating,
  validationProcess: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Work.",
  },
  items: [
    {
      parsed: true,
      output: "issueinfo",
      id: "good.id",
      label: "nice label",
      message: "Figured this one out",
    },
    {
      parsed: false,
      message: "This one not so much.",
    },
  ],
};

test(
  "ValidatedDMDTask schema parses a valid object",
  isValidValidated,
  goodValidated
);

test(
  "ValidatedDMDTask schema does not parse as Validating",
  isInvalidValidating,
  goodValidated
);

const goodQueued: QueuedDMDTask = {
  ...goodValidated,
  storeProcess: { requestDate: then },
  items: [
    {
      parsed: true,
      output: "issueinfo",
      id: "good.id",
      label: "nice label",
      message: "Figured this one out",
      destination: "access",
    },
    {
      parsed: false,
      message: "This one not so much.",
      destination: "access",
    },
  ],
};

test("QueuedDMDTask schema parses a valid object.", isValidQueued, goodQueued);

const goodFailed: FailedDMDTask = {
  ...goodQueued,
  id: "processing-failed",
  storeProcess: {
    requestDate: then,
    processDate: now,
    succeeded: false,
    message: "Didn't work.",
  },
  updated: now,
  items: [
    {
      parsed: true,
      output: "issueinfo",
      id: "good.id",
      label: "nice label",
      message: "Not stored",
      stored: false,
      destination: "access",
    },
    {
      parsed: false,
      stored: false,
      destination: "access",
      message: "This one not so much.",
    },
  ],
};

test("FailedDMDTask schema parses a valid object", isValidFailed, goodFailed);

test(
  "FailedDMDTask schema does not parse as queued.",
  isInvalidQueued,
  goodFailed
);

const goodSucceeded: SucceededDMDTask = {
  ...goodFailed,
  id: "processing-succeeded",
  attachments: {
    metadata: metadataAttachment,
    "0.json": jsonAttachment,
    "0.xml": xmlAttachment,
  },
  storeProcess: {
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
      stored: true,
      destination: "access",
    },
    {
      parsed: false,
      stored: false,
      destination: "access",
      message: "This one not so much.",
    },
  ],
};

test(
  "SucceededDMDTask schema parses a valid object",
  isValidSucceeded,
  goodSucceeded
);

test(
  "SucceededDMDTask schema does not parse as queued.",
  isInvalidQueued,
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
  "SucceededDMDTask schema does not parse when a parsed item lacks an output.",
  isInvalidSucceeded,
  itemWithout("output")
);

test(
  "SucceededDMDTask schema does not parse when a parsed item lacks a label.",
  isInvalidSucceeded,
  itemWithout("label")
);
