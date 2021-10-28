module.exports = {
  map: function (doc) {
    if (
      typeof doc.source == "object" &&
      typeof doc.master == "object" &&
      doc.source.from === "cihm"
    ) {
      emit(doc.source.path, null);
    }
  },
  reduce: "_count",
};
