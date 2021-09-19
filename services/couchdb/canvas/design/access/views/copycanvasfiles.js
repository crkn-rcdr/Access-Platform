module.exports = {
  map: function (doc) {
    if (
      doc.orphan !== true &&
      (("master" in doc && "path" in doc.master) ||
        ("ocrPdf" in doc && "path" in doc.ocrPdf))
    ) {
      emit(null, null);
    }
  },
  reduce: "_count",
};
