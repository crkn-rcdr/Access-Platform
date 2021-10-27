module.exports = {
  map: function (doc) {
    if (typeof doc.file == "object") {
      if (typeof doc.ocrPdf == "object") {
        emit("both", null);
      } else {
        emit("file", null);
      }
    } else {
      if (typeof doc.ocrPdf == "object") {
        emit("ocrPdf", null);
      } else {
        emit("none", null);
      }
    }
  },
  reduce: "_count",
};
