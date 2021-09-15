module.exports = {
  map: function (doc) {
    emit(doc.ocrType, null);
  },
  reduce: "_count",
};
