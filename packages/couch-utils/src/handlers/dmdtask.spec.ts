import { WaitingDMDTask } from "@crkn-rcdr/access-data";
import anyTest, { TestInterface } from "ava";
import { BaseContext, getTestContext } from "../test.js";
import { DMDTaskHandler } from "./dmdtask.js";

type DMDTaskHandlerContext = BaseContext & { dmdtask: DMDTaskHandler };

const test = anyTest as TestInterface<DMDTaskHandlerContext>;

const USER = { name: "User McGee", email: "mcgee@crkn.ca" };

test.before(async (t) => {
  const baseContext = await getTestContext();
  t.context = {
    ...baseContext,
    dmdtask: new DMDTaskHandler(baseContext.client, "handler"),
  };
  await t.context.testDeploy("dmdtask", "handler");
});

test.serial("Can create new DMDTasks", async (t) => {
  const contents = "this is a file, I guess!";
  const file = Buffer.from(contents).toString("base64");
  const taskId = await t.context.dmdtask.create({
    user: USER,
    format: "csvissueinfo",
    file,
  });

  const task = await t.context.dmdtask.get(taskId);

  t.true(WaitingDMDTask.safeParse(task).success);

  const serverfile = await t.context.dmdtask.getAttachment({
    document: taskId,
    attachment: "metadata",
  });

  t.is(serverfile.toString(), contents);
});

test.after.always(async (t) => {
  await t.context.testDestroy("dmdtask", "handler");
});
