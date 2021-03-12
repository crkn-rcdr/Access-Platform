const test = require("ava");
const Kivik = require("kivik").Kivik;

test("Kivik can load things", async (t) => {
  await t.notThrowsAsync(Kivik.fromDirectory(__dirname));
});
