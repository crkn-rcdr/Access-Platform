const test = require("ava");
const { getInstance } = require("../../../..");

const NOID = "69429/m02n4zg6h671";

test.before(async (t) => {
  t.context.instance = await getInstance();
});

test.beforeEach(async (t) => {
  t.context.access = await t.context.instance.deployDb(
    "access",
    "force-meta-update"
  );
});

test("A hammer update can be forced", async (t) => {
  const start = Date.now() / 1000;
  const access = t.context.access;

  const response = await access.updateWithHandler(
    "metadatabus",
    "forceUpdate",
    NOID
  );

  t.is(response.message, "Hammer update forced for oocihm.8_06941_2");

  const doc = await access.get(NOID);
  t.true(doc.updateInternalmeta.requestDate > start);
});
