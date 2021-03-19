const test = require("ava");
const Kivik = require("kivik").Kivik;

test("Kivik can load things", async (t) => {
  await t.notThrowsAsync(Kivik.fromDirectory(__dirname));
});

test("Fixtures validate", async (t) => {
  const results = await Kivik.testFixtures(__dirname);
  // TODO: rewrite when https://github.com/crkn-rcdr/kivik/issues/51 is done
  const total = Object.values(results).reduce(
    (num, invalid) => num + Object.keys(invalid).length,
    0
  );
  t.is(total, 0);
});
