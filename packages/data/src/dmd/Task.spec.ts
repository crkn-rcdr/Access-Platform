import test from "ava";
import { tester } from "../testHelper.js";
import { User } from "../util/User.js";

import {
  ParsingDMDTask,
  UpdateFailedDMDTask,
  UpdateSucceededDMDTask,
  UpdatingDMDTask,
  ParseSucceededDMDTask,
} from "./Task.js";

const { isValid: isValidParsing, isInvalid: isInvalidParsing } =
  tester(ParsingDMDTask);
const { isValid: isValidParsed, isInvalid: isInvalidParsed } = tester(
  ParseSucceededDMDTask
);
const { isValid: isValidUpdating, isInvalid: isInvalidUpdating } =
  tester(UpdatingDMDTask);
const { isValid: isValidFailed } = tester(UpdateFailedDMDTask);
const { isValid: isValidSucceeded, isInvalid: isInvalidSucceeded } = tester(
  UpdateSucceededDMDTask
);

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

const goodParsing: ParsingDMDTask = {
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
  "ParsingDMDTask schema parses a valid object.",
  isValidParsing,
  goodParsing
);

test(
  "ParsingDMDTask schema does not parse as Validated.",
  isInvalidParsed,
  goodParsing
);

const goodValidated: ParseSucceededDMDTask = {
  ...goodParsing,
  process: {
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
  "ParseSucceededDMDTask schema parses a valid object.",
  isValidParsed,
  goodValidated
);

test(
  "ParseSucceededDMDTask schema does not parse as Parsing.",
  isInvalidParsing,
  goodValidated
);

const goodQueued: UpdatingDMDTask = {
  ...goodValidated,
  process: { requestDate: then },
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

test(
  "UpdatingDMDTask schema parses a valid object.",
  isValidUpdating,
  goodQueued
);

const goodFailed: UpdateFailedDMDTask = {
  ...goodQueued,
  id: "processing-failed",
  process: {
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

test(
  "UpdateFailedDMDTask schema parses a valid object",
  isValidFailed,
  goodFailed
);

test(
  "UpdateFailedDMDTask schema does not parse as Updating..",
  isInvalidUpdating,
  goodFailed
);

const goodSucceeded: UpdateSucceededDMDTask = {
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
  "UpdateSucceededDMDTask schema parses a valid object",
  isValidSucceeded,
  goodSucceeded
);

test(
  "UpdateSucceededDMDTask schema does not parse as queued.",
  isInvalidUpdating,
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
  "UpdateSucceededDMDTask schema does not parse when a parsed item lacks an id",
  isInvalidSucceeded,
  itemWithout("id")
);

test(
  "UpdateSucceededDMDTask schema does not parse when a parsed item lacks an output.",
  isInvalidSucceeded,
  itemWithout("output")
);

test(
  "UpdateSucceededDMDTask schema does not parse when a parsed item lacks a label.",
  isInvalidSucceeded,
  itemWithout("label")
);
