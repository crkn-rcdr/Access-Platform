import {
  ExportWaitingOcrBatch,
  ExportSucceededOcrBatch,
  ImportSucceededOcrBatch,
  ImportWaitingOcrBatch,
  OcrBatch,
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
  t.true(ExportWaitingOcrBatch.safeParse(batch).success);
});

test.serial("Can update ocr export", async (t) => {
  let batch = await t.context.ocr.requestExport({
    id: TEST_ID,
    user: USER,
  });
  t.true(ExportWaitingOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.updateExport({
    id: TEST_ID,
    user: USER,
    succeeded: true,
  });
  t.true(ExportSucceededOcrBatch.safeParse(batch).success);
});

test.serial("Can request ocr import", async (t) => {
  let batch = await t.context.ocr.requestExport({
    id: TEST_ID,
    user: USER,
  });
  t.true(ExportWaitingOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.updateExport({
    id: TEST_ID,
    user: USER,
    succeeded: true,
  });
  t.true(ExportSucceededOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.requestImport({
    id: TEST_ID,
    user: USER,
  });
  t.true(ImportWaitingOcrBatch.safeParse(batch).success);
});

test.serial("Can update ocr import", async (t) => {
  let batch = await t.context.ocr.requestExport({
    id: TEST_ID,
    user: USER,
  });
  t.true(ExportWaitingOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.updateExport({
    id: TEST_ID,
    user: USER,
    succeeded: true,
  });
  t.true(ExportSucceededOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.requestImport({
    id: TEST_ID,
    user: USER,
  });
  t.true(ImportWaitingOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.updateImport({
    id: TEST_ID,
    user: USER,
    succeeded: true,
  });
  t.true(ImportSucceededOcrBatch.safeParse(batch).success);
});

test.serial("Can cancel ocr export", async (t) => {
  let batch = await t.context.ocr.requestExport({
    id: TEST_ID,
    user: USER,
  });
  t.true(ExportWaitingOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.cancelExport({
    id: TEST_ID,
    user: USER,
  });
  t.true(
    OcrBatch.safeParse(batch).success &&
      !ExportWaitingOcrBatch.safeParse(batch).success
  );
});

test.serial("Can cancel ocr import", async (t) => {
  let batch = await t.context.ocr.requestExport({
    id: TEST_ID,
    user: USER,
  });
  t.true(ExportWaitingOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.updateExport({
    id: TEST_ID,
    user: USER,
    succeeded: true,
  });
  t.true(ExportSucceededOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.requestImport({
    id: TEST_ID,
    user: USER,
  });
  t.true(ImportWaitingOcrBatch.safeParse(batch).success);

  batch = await t.context.ocr.cancelImport({
    id: TEST_ID,
    user: USER,
  });
  t.true(
    OcrBatch.safeParse(batch).success &&
      !ImportWaitingOcrBatch.safeParse(batch).success
  );
});

test.serial("Can edit an ocr batch", async (t) => {
  const batch = await t.context.ocr.editBatch({
    id: TEST_ID,
    user: USER,
    data: {
      priority: 100,
    },
  });
  t.true(batch.priority === 100);
});

test.after.always(async (t) => {
  await t.context.testDestroy("ocr", "handler");
});
