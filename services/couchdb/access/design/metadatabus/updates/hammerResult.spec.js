const test = require("ava");
const { getInstance } = require("../../../..");

const NOID = "69429/m02n4zg6h671";

test.before(async (t) => {
  t.context.instance = await getInstance();
});

test.beforeEach(async (t) => {
  t.context.access = await t.context.instance.deployDb(
    "access",
    "hammer-result"
  );
});

test("A hammer update can be forced", async (t) => {
  const start = Date.now() / 1000;
  const access = t.context.access;

  await access.updateWithHandler("metadatabus", "forceUpdate", NOID);

  const response = await access.updateWithHandler(
    "metadatabus",
    "hammerResult",
    NOID,
    { succeeded: false, message: "failure" }
  );

  t.is(
    response.message,
    "Updated oocihm.8_06941_2 with the results of a Hammer operation"
  );

  let doc = await access.get(NOID);
  t.true(doc.updateInternalmeta.processDate > start);
  t.false(doc.updateInternalmeta.succeeded);
  t.is(doc.updateInternalmeta.message, "failure");

  await access.updateWithHandler("metadatabus", "hammerResult", NOID, {
    succeeded: true,
  });
  doc = await access.get(NOID);
  t.is(doc.updateInternalmeta.message, undefined);
});
