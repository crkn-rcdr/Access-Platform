module.exports = {
  map: function (doc) {
    if ("type" in doc) {
      emit(doc.type, null);
    }
  },
  reduce: "_count",
};
