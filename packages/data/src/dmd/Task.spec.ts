import test from "ava";
import { tester } from "../testHelper.js";
import { User } from "../util/User.js";

import {
  StoringPausedDMDTask,
  StoringSucceededDMDTask,
  StoringFailedDMDTask,
  StoringDMDTask,
  StoreQueuedDMDTask,
  ParsingSucceededDMDTask,
  ParsingFailedDMDTask,
  ParsingDMDTask,
  ParsingQueuedDMDTask,
  BaseDMDTask,
} from "./Task.js";

const {
  isValid: isValidStoringPausedDMDTask,
  isInvalid: isInvalidStoringPausedDMDTask,
} = tester(StoringPausedDMDTask);
const {
  isValid: isValidStoringSucceededDMDTask,
  isInvalid: isInvalidStoringSucceededDMDTask,
} = tester(StoringSucceededDMDTask);
const {
  isValid: isValidStoringFailedDMDTask,
  isInvalid: isInvalidStoringFailedDMDTask,
} = tester(StoringFailedDMDTask);
const { isValid: isValidStoringDMDTask, isInvalid: isInvalidStoringDMDTask } =
  tester(StoringDMDTask);
const {
  isValid: isValidStoreQueuedDMDTask,
  isInvalid: isInvalidStoreQueuedDMDTask,
} = tester(StoreQueuedDMDTask);
const {
  isValid: isValidParsingSucceededDMDTask,
  isInvalid: isInvalidParsingSucceededDMDTask,
} = tester(ParsingSucceededDMDTask);
const {
  isValid: isValidParsingFailedDMDTask,
  isInvalid: isInvalidParsingFailedDMDTask,
} = tester(ParsingFailedDMDTask);
const { isValid: isValidParsingDMDTask, isInvalid: isInvalidParsingDMDTask } =
  tester(ParsingDMDTask);
const {
  isValid: isValidParsingQueuedDMDTask,
  isInvalid: isInvalidParsingQueuedDMDTask,
} = tester(ParsingQueuedDMDTask);
const { isValid: isValidBaseDMDTask, isInvalid: isInvalidBaseDMDTask } =
  tester(BaseDMDTask);

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

const baseTask: BaseDMDTask = {
  id: "waiting-for-processing",
  attachments: {
    metadata: metadataAttachment,
  },
  user: USER,
  format: "csvissueinfo",
  updated: then,
};

test("BaseDMDTask schema parses a valid object", isValidBaseDMDTask, baseTask);
test("BaseDMDTask schema parses an invalid object", isInvalidBaseDMDTask, {});

const parseQueueTask: ParsingQueuedDMDTask = {
  process: { requestDate: then },
  ...baseTask,
};
test(
  "ParsingQueuedDMDTask schema parses a valid object",
  isValidParsingQueuedDMDTask,
  parseQueueTask
);
test(
  "ParsingQueuedDMDTask schema parses an invalid object",
  isInvalidParsingQueuedDMDTask,
  baseTask
);

const parseTask: ParsingDMDTask = {
  ...parseQueueTask,
  stage: "parsing",
};
test(
  "ParsingDMDTask schema parses a valid object",
  isValidParsingDMDTask,
  parseTask
);
test(
  "ParsingDMDTask schema parses an invalid object",
  isInvalidParsingDMDTask,
  parseQueueTask
);

const parseFailTask: ParsingFailedDMDTask = {
  ...parseQueueTask,
  process: {
    requestDate: then,
    processDate: now,
    succeeded: false,
    message: "failed.",
  },
};
test(
  "ParsingFailedDMDTask schema parses a valid object",
  isValidParsingFailedDMDTask,
  parseFailTask
);
test(
  "ParsingFailedDMDTask schema parses an invalid object",
  isInvalidParsingFailedDMDTask,
  parseTask
);

const parseSuccTask: ParsingSucceededDMDTask = {
  ...parseQueueTask,
  process: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Worked.",
  },
  items: [
    {
      output: "issueinfo",
      id: "8_06941",
      message: "",
      parsed: true,
      label: "Testing collection",
    },
    {
      output: "issueinfo",
      id: "8_06941_1",
      message: "Should not be found in preservation test",
      parsed: true,
      label: "Testing manifest 1",
    },
    {
      output: "issueinfo",
      id: "8_06941_2",
      message: "Parse failed to generate xml and json test",
      parsed: false,
      label: "Testing manifest 2",
    },
  ],
  itemsCount: 3,
  attachments: {
    metadata: metadataAttachment,
    "flatten.json": jsonAttachment,
    "dmd.json": xmlAttachment,
  },
};
test(
  "ParsingSucceededDMDTask schema parses a valid object",
  isValidParsingSucceededDMDTask,
  parseSuccTask
);
test(
  "ParsingSucceededDMDTask schema parses an invalid object",
  isInvalidParsingSucceededDMDTask,
  parseFailTask
);

const storeQueueTask: StoreQueuedDMDTask = {
  ...parseSuccTask,
  items: [...parseSuccTask.items].map((item) => {
    return { ...item, shouldStore: item.parsed };
  }),
  itemsCount: 3,
  destination: "access",
  process: { requestDate: then },
};
test(
  "StoreQueuedDMDTask schema parses a valid object",
  isValidStoreQueuedDMDTask,
  storeQueueTask
);
test(
  "StoreQueuedDMDTask schema parses an invalid object",
  isInvalidStoreQueuedDMDTask,
  parseSuccTask
);

const storeTask: StoringDMDTask = {
  ...storeQueueTask,
  stage: "store-started",
  progress: 0,
};
test(
  "StoringDMDTask schema parses a valid object",
  isValidStoringDMDTask,
  storeTask
);
test(
  "StoringDMDTask schema parses an invalid object",
  isInvalidStoringDMDTask,
  storeQueueTask
);

const storeFailTask: StoringFailedDMDTask = {
  ...storeQueueTask,
  process: {
    requestDate: then,
    processDate: now,
    succeeded: false,
    message: "failed.",
  },
  items: [...storeQueueTask.items].map((item) => {
    return { ...item, stored: false };
  }),
};
test(
  "StoringFailedDMDTask schema parses a valid object",
  isValidStoringFailedDMDTask,
  storeFailTask
);
test(
  "StoringFailedDMDTask schema parses an invalid object",
  isInvalidStoringFailedDMDTask,
  storeTask
);

const storeSuccTask: StoringSucceededDMDTask = {
  ...storeQueueTask,
  process: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Worked.",
  },
  items: [...storeQueueTask.items].map((item) => {
    return { ...item, stored: item.parsed };
  }),
};
test(
  "StoringSucceededDMDTask schema parses a valid object",
  isValidStoringSucceededDMDTask,
  storeSuccTask
);
test(
  "StoringSucceededDMDTask schema parses an invalid object",
  isInvalidStoringSucceededDMDTask,
  storeFailTask
);

const storePauseTask: StoringPausedDMDTask = {
  ...storeQueueTask,
  process: {
    requestDate: then,
    processDate: now,
    succeeded: true,
    message: "Paused.",
  },
  stage: "store-paused",
};
test(
  "StoringPausedDMDTask schema parses a valid object",
  isValidStoringPausedDMDTask,
  storePauseTask
);
test(
  "StoringPausedDMDTask schema parses an invalid object",
  isInvalidStoringPausedDMDTask,
  storeSuccTask
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
    ...storeSuccTask,
    items: [goodItem, badItem],
  };
};

test(
  "StoringSucceededDMDTask schema does not parse when a parsed item lacks an id",
  isInvalidStoringSucceededDMDTask,
  itemWithout("id")
);

test(
  "StoringSucceededDMDTask schema does not parse when a parsed item lacks an output.",
  isInvalidStoringSucceededDMDTask,
  itemWithout("output")
);

test(
  "StoringSucceededDMDTask schema does not parse when a parsed item lacks a label.",
  isInvalidStoringSucceededDMDTask,
  itemWithout("label")
);
