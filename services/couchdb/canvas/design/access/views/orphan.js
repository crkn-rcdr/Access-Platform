module.exports = {
  map: function (doc) {
    if (doc.orphan) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
