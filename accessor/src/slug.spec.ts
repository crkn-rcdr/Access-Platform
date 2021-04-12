import { test } from "./test";
import { slugInterface } from "./slug";

test.beforeEach(async (t) => {
  t.context.access = await t.context.instance.deployDb("access", "slug");
});

test("Resolves a slug to a noid", async (t) => {
  const slug = slugInterface(t.context.access);
  const noid = await slug.resolve("oocihm.8_06941");
  t.is(noid, "69429/s0vq2s46j98h");
  const shouldBeNull = await slug.resolve("notaslug");
  t.is(shouldBeNull, null);
});
