module.exports = {
  map: function (doc) {
    if (doc.type !== "collection") {
      if (typeof doc.file == "object") {
        if (typeof doc.ocrPdf == "object") {
          emit("both", doc.slug);
        } else {
          emit("file", doc.slug);
        }
      } else {
        if (typeof doc.ocrPdf == "object") {
          emit("ocrPdf", doc.slug);
        } else {
          emit("none", doc.slug);
        }
      }
    }
  },
  reduce: "_count",
};
