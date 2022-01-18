import {
  ExportWaitingOcrBatch,
  /*ExportSucceededOcrBatch,
  ImportSucceededOcrBatch,
  ImportWaitingOcrBatch,*/
} from "@crkn-rcdr/access-data";
import anyTest, { TestInterface } from "ava";
import { BaseContext, getTestContext } from "../test.js";
import { OcrBatchHandler } from "./ocr.js";

type OcrBatchHandlerContext = BaseContext & { ocr: OcrBatchHandler };

const test = anyTest as TestInterface<OcrBatchHandlerContext>;

const USER = { name: "User McGee", email: "mcgee@crkn.ca" };
const TEST_ID = "testBaseBatch";

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    ocr: new OcrBatchHandler(baseContext.client, "handler"),
  };
  await t.context.testDeploy("ocr", "handler");
});

test.serial("Can request ocr export", async (t) => {
  const batch = await t.context.ocr.requestExport({
    id: TEST_ID,
    user: USER,
  });
  console.log("batch 1: ", batch);
  t.true(ExportWaitingOcrBatch.safeParse(batch).success);
});

/*
test.serial("Can update ocr export", async (t) => {
  await t.context.ocr.update({
    ddoc: "access",
    name: "updateOCRExport",
    docId: TEST_ID,
    body: {
      user: USER,
      succeeded: true,
    },
  });

  const doc = await t.context.ocr.get(TEST_ID);
  console.log("doc 2: ", doc);

  t.true(ExportSucceededOcrBatch.safeParse(doc).success);
});

test.serial("Can request ocr import", async (t) => {
  await t.context.ocr.update({
    ddoc: "access",
    name: "requestOCRImport",
    docId: TEST_ID,
    body: {
      user: USER,
    },
  });

  const doc = await t.context.ocr.get(TEST_ID);
  console.log("doc 3: ", doc);

  t.true(ImportWaitingOcrBatch.safeParse(doc).success);
});

test.serial("Can update ocr import", async (t) => {
  await t.context.ocr.update({
    ddoc: "access",
    name: "updateOCRImport",
    docId: TEST_ID,
    body: {
      user: USER,
      succeeded: true,
    },
  });

  const doc = await t.context.ocr.get(TEST_ID);
  console.log("doc 4: ", doc);

  t.true(ImportSucceededOcrBatch.safeParse(doc).success);
});*/

test.after.always(async (t) => {
  await t.context.testDestroy("ocr", "handler");
});
