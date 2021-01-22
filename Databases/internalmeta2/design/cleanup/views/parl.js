module.exports = {
  map: function (doc) {
    if (
      "sub-type" in doc &&
      doc["sub-type"] === "series" &&
      "collections" in doc &&
      Array.isArray(doc.collections) &&
      doc.collections.length === 1 &&
      doc.collections[0] === "parl"
    ) {
      emit("approved" in doc, null);
    }
  },
  reduce: "_count",
};
