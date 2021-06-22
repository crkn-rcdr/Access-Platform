const test = require("ava");
const { getInstance } = require("../../../..");
const { dateAsArray } = require("../../../../prelude");

const NOID = "69429/m02n4zg6h671";

test.before(async (t) => {
  t.context.instance = await getInstance();
});

test.beforeEach(async (t) => {
  t.context.access = await t.context.instance.deployDb(
    "access",
    "hammer-views"
  );
});

test("Hammer views respond to updates", async (t) => {
  const dateArray = dateAsArray(new Date());
  const access = t.context.access;

  await access.updateWithHandler("metadatabus", "forceUpdate", NOID);

  const queueResponse = await access.view("metadatabus", "hammerQueue", {
    reduce: false,
  });
  const queueResult = queueResponse.rows[0];
  t.is(queueResult.id, NOID);
  // TODO: This will fail with weird date boundaries, maybe
  t.deepEqual(queueResult.key.slice(0, 3), dateArray.slice(0, 3));

  await access.updateWithHandler("metadatabus", "hammerResult", NOID, {
    succeeded: true,
    message: "A message!",
  });

  const statusResponse = await access.view("metadatabus", "hammerStatus", {
    reduce: false,
  });
  const statusResult = statusResponse.rows[0];
  t.is(statusResult.id, NOID);
  t.true(statusResult.key[0]);
  t.deepEqual(statusResult.key.slice(1, 4), dateArray.slice(0, 3));
  t.is(statusResult.value, "A message!");
});
