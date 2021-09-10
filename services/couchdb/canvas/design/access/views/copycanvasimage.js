module.exports = {
  map: function (doc) {
    if ("master" in doc && "path" in doc.master) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
