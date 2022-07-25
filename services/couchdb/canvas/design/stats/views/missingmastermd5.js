module.exports = {
  map: function (doc) {
    if ("master" in doc && !("md5" in doc.master)) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
