import { test as parentTest, TestContext, TestInterface } from "./test";
import { SlugInterface, slugInterface } from "./slug";

const VALID_SLUG = "oocihm.8_06941";
const EXPECTED_NOID = "69429/s0vq2s46j98h";
const INVALID_SLUG = "notaslug";
const LIST_WITHOUT_PREFIX = ["8_06941", "8_06941_1", "8_06941_2"];

interface SlugContext extends TestContext {
  slug: SlugInterface;
}

const test = parentTest as TestInterface<SlugContext>;

// TODO: change this back to test.beforeEach when kivik#66 is resolved
test.serial.before(async (t) => {
  const access = await t.context.deployDb("access", "slug-interface");

  t.context.slug = slugInterface(access);
});

test("Resolves a slug to a noid", async (t) => {
  const noid = await t.context.slug.resolve(VALID_SLUG);
  t.is(noid, EXPECTED_NOID);
  const shouldBeNull = await t.context.slug.resolve(INVALID_SLUG);
  t.is(shouldBeNull, null);
});

test("Resolves many slugs to noids", async (t) => {
  const response = await t.context.slug.resolveMany([VALID_SLUG, INVALID_SLUG]);
  t.is(response.get(VALID_SLUG), EXPECTED_NOID);
  t.is(response.get(INVALID_SLUG), null);
  t.is(response.get("not_looked_up"), undefined);
});

test("Resolves many prefixed slugs to noids", async (t) => {
  const response = await t.context.slug.resolveMany(
    LIST_WITHOUT_PREFIX,
    "oocihm."
  );
  t.is(
    [...response.values()].filter((noid) => noid !== null).length,
    LIST_WITHOUT_PREFIX.length
  );
});

test("Searches for slugs", async (t) => {
  const searchOne = await t.context.slug.search("oocihm.8_06941");
  t.is(searchOne.size, 3);
  t.is(searchOne.get(VALID_SLUG), EXPECTED_NOID);
  const searchTwo = await t.context.slug.search("oocihm.8_06941_");
  t.is(searchTwo.size, 2);
  const searchNone = await t.context.slug.search("probably_not_there");
  t.is(searchNone.size, 0);
});
