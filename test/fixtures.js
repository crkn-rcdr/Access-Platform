const chai = require("chai");
chai.should();

const nano = require("nano")("http://couch:5984/");
const manifest = nano.use("manifest");
const collection = nano.use("collection");

describe("Fixtures load correctly", () => {
  it("Loads manifests", async () => {
    let rows = (await manifest.list({ endkey: "69429/n" })).rows;
    rows.length.should.equal(4, "Number of manifest fixtures");
  });

  it("Loads collections", async () => {
    let rows = (await collection.list({ endkey: "69429/t" })).rows;
    rows.length.should.equal(2, "Number of collection fixtures");
  });
});
