import { ParsingDMDTask } from "@crkn-rcdr/access-data";
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
    fileName: "test.csv",
  });

  const task = await t.context.dmdtask.get(taskId);

  t.true(ParsingDMDTask.safeParse(task).success);

  const serverfile = await t.context.dmdtask.getAttachment({
    document: taskId,
    attachment: "metadata",
  });

  t.is(serverfile.toString(), contents);

  // Ensure that the new task appears in processQueue
  const response = await t.context.dmdtask.view("access", "processQueue", {
    reduce: false,
  });
  t.is(response.rows[0]?.id, taskId);
});

test.after.always(async (t) => {
  await t.context.testDestroy("dmdtask", "handler");
});
