module.exports = {
  map: function (doc) {
    if (typeof doc.master == "object") {
      emit(doc.master.extension, null);
    }
  },
  reduce: "_count",
};
