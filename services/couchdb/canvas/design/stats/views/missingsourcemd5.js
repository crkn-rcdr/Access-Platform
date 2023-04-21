module.exports = {
  map: function (doc) {
    if (
      typeof doc.source == "object" &&
      doc.source.from === "cihm" &&
      !("md5" in doc.source)
    ) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
