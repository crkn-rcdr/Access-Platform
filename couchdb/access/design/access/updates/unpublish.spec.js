const test = require("ava");
const testInstance = require("../../../../testInstance");

const NOID = "69429/m02n4zg6h671";

test.before(async (t) => {
  t.context.instance = await testInstance();
});

test.beforeEach(async (t) => {
  t.context.access = await t.context.instance.deployDb("access", "unpublish");
});

test("An access document can be unpublished", async (t) => {
  const start = Date.now() / 1000;
  const response = await t.context.access.updateWithHandler(
    "access",
    "unpublish",
    NOID
  );
  t.is(response.message, "oocihm.8_06941_2 unpublished");

  const doc = await t.context.access.get(NOID);
  t.false("public" in doc);
  t.true(doc.updateInternalmeta.requestDate > start);
  t.false("processDate" in doc.updateInternalmeta);
});
