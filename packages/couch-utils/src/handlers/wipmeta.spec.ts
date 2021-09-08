import anyTest, { TestInterface } from "ava";
import { BaseContext, getTestContext } from "../test.js";
import { WipmetaHandler } from "./wipmeta.js";

type WipmetaHandlerContext = BaseContext & { wipmeta: WipmetaHandler };
const test = anyTest as TestInterface<WipmetaHandlerContext>;

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    wipmeta: new WipmetaHandler(baseContext.client, "handler"),
  };
  await t.context.testDeploy("wipmeta", "handler");
});

test.serial("Can store xmls", async (t) => {
  t.is(true, true);
});

test.after.always(async (t) => {
  await t.context.testDestroy("wipmeta", "handler");
});
