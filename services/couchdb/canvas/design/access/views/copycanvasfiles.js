module.exports = {
  map: function (doc) {
    if (doc.orphan !== true && "master" in doc && "path" in doc.master) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
