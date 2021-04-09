const test = require("ava");
const { getInstance } = require("../../../..");

const NOID = "69429/m02n4zg6h671";

test.before(async (t) => {
  t.context.instance = await getInstance();
});

test.beforeEach(async (t) => {
  t.context.access = await t.context.instance.deployDb("access", "publish");
});

test("An access document can be published", async (t) => {
  const start = Date.now() / 1000;
  const access = t.context.access;

  // We have to unpublish before we can publish!
  await access.updateWithHandler("access", "unpublish", NOID);

  const response = await access.updateWithHandler("access", "publish", NOID);
  t.is(response.message, "oocihm.8_06941_2 published");

  const doc = await access.get(NOID);
  t.true(doc.public > start);
  t.is(doc.public, doc.updateInternalmeta.requestDate);
  t.false("processDate" in doc.updateInternalmeta);
});
