const test = require("ava");
const kivik = require("kivik");

test.before(async (t) => {
  t.context.instance = await kivik.getInstance(".");
});

test.beforeEach(async (t) => {
  const handlers = await t.context.instance.deploy("unpublish");
  t.context.access = handlers.get("access");
});

test("An access document can be unpublished", async (t) => {
  const response = await t.context.access.updateWithHandler(
    "access",
    "unpublish",
    "69429/m02n4zg6h671",
    {}
  );
  t.true(response.message.endsWith("unpublished"));

  const doc = await t.context.access.get("69429/m02n4zg6h671");
  t.false("public" in doc);
  t.false("processDate" in doc.updateInternalmeta);
});
