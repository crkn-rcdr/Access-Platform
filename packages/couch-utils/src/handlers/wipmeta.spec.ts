import anyTest, { TestInterface } from "ava";
import { BaseContext, getTestContext } from "../test.js";
import { WipmetaHandler } from "./wipmeta.js";
//import { WipmetaObject } from "@crkn-rcdr/access-data";

type WipmetaHandlerContext = BaseContext & { wipmeta: WipmetaHandler };
const test = anyTest as TestInterface<WipmetaHandlerContext>;

const WIPMETA_OBJECT_ID = "test";
const ATTACHMENT_CONTENT = "<hello>world!</hello>";
const LABEL = "testing!";

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    wipmeta: new WipmetaHandler(baseContext.client, "handler"),
  };
  await t.context.testDeploy("wipmeta", "handler");
});

test.serial("Can get wipmeta object by id", async (t) => {
  const dmdObject = await t.context.wipmeta.get(WIPMETA_OBJECT_ID);
  t.is(dmdObject.id, WIPMETA_OBJECT_ID);
});
test.serial("Can update wipmeta object label", async (t) => {
  await t.context.wipmeta.updateLabel({
    id: WIPMETA_OBJECT_ID,
    label: LABEL,
  });
  const dmdObject = await t.context.wipmeta.get(WIPMETA_OBJECT_ID);
  t.is(dmdObject.label, LABEL);
});
test.serial("Can insert and get attachments", async (t) => {
  const file = new Buffer(ATTACHMENT_CONTENT).toString("base64");
  await t.context.wipmeta.uploadBase64Attachment({
    document: WIPMETA_OBJECT_ID,
    attachment: file,
    attachmentName: "test.xml",
    contentType: "application/octet-stream",
  });
  const dmdBuffer = await t.context.wipmeta.getAttachment({
    document: WIPMETA_OBJECT_ID,
    attachment: "test.xml",
  });
  t.is(
    dmdBuffer.toString(),
    ATTACHMENT_CONTENT,
    "Attachment contents is correct?"
  );
});

test.after.always(async (t) => {
  await t.context.testDestroy("wipmeta", "handler");
});
