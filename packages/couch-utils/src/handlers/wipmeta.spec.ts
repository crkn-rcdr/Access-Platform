import anyTest, { TestInterface } from "ava";
import { BaseContext, getTestContext } from "../test.js";
import { WipmetaHandler } from "./wipmeta.js";
import { WipmetaObject } from "@crkn-rcdr/access-data";

type WipmetaHandlerContext = BaseContext & { wipmeta: WipmetaHandler };
const test = anyTest as TestInterface<WipmetaHandlerContext>;

const WIPMETA_OBJECT = "";

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    wipmeta: new WipmetaHandler(baseContext.client, "handler"),
  };
  await t.context.testDeploy("wipmeta", "handler");
});

test.serial("Can store xml", async (t) => {
  let wipmetaObject = WipmetaObject.parse(
    await t.context.wipmeta.get(WIPMETA_OBJECT)
  );
  const originalDmd = wipmetaObject.attachments?.["dmd.xml"];

  console.log("originalDmd", originalDmd);

  t.true(originalDmd);
  t.is(true, true);
});

test.after.always(async (t) => {
  await t.context.testDestroy("wipmeta", "handler");
});
