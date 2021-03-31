const test = require("ava");
const Kivik = require("kivik");

test("Kivik can load things", async (t) => {
  await t.notThrowsAsync(Kivik.createKivik(__dirname));
});

test("Fixtures validate", async (t) => {
  const kivik = await Kivik.createKivik(__dirname, "fixtures");
  const results = kivik.validateFixtures();
  t.is(results.size, 0);
});
