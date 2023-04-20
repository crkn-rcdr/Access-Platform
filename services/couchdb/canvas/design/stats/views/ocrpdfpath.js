module.exports = {
  map: function (doc) {
    if (doc.orphan !== true && "ocrPdf" in doc && "path" in doc.ocrPdf) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
