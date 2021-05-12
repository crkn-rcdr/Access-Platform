import { test as parentTest, TestContext, TestInterface } from "../test";
import { getRetriever } from "./object";

interface ObjectTestContext extends TestContext {
  retrieve: ReturnType<typeof getRetriever>;
}

const test = parentTest as TestInterface<ObjectTestContext>;

test.serial.before(async (t) => {
  const access = await t.context.deployDb("access", "objects");
  const canvas = await t.context.deployDb("canvas", "objects");

  t.context.retrieve = getRetriever({ access, canvas });
});

test("Can retrieve a collection", async (t) => {
  const collection = await t.context.retrieve("69429/s0vq2s46j98h");
  if (collection.isCollection()) {
    t.is(collection.data.slug, "oocihm.8_06941");
  } else {
    t.fail("Retrieved object isn't a collection");
  }
});

test("Can retreive a canvas", async (t) => {
  const canvas = await t.context.retrieve("69429/c0cj87k0gq3s");
  if (canvas.isCanvas()) {
    t.is(
      canvas.data.master.path,
      "oocihm.8_06941_2/data/sip/data/files/0008.jpg"
    );
  }
});

test("Returns null if the input cannot be found", async (t) => {
  const notAnObject = await t.context.retrieve("not.a.noid");
  t.is(notAnObject, null);
});
