module.exports = {
  map: function (doc) {
    if ("orphan" in doc && doc.orphan) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
