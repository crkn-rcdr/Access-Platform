module.exports = {
  map: function (doc) {
    if (
      "type" in doc &&
      doc.type === "series" &&
      "collection" in doc &&
      Array.isArray(doc.collection) &&
      doc.collection.length === 1 &&
      doc.collection[0] === "parl"
    ) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
