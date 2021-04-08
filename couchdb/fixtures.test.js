const test = require("ava");
const Kivik = require("kivik");

test("Fixtures validate", async (t) => {
  const kivik = await Kivik.createKivik(__dirname, "fixtures");
  const results = kivik.validateFixtures();
  t.is(results.size, 0);
});
