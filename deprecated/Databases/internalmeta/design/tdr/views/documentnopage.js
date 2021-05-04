module.exports = {
  map: function (doc) {
    if (
      "sub-type" in doc &&
      doc["sub-type"] === "document" &&
      !("pageinfo" in doc)
    ) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
