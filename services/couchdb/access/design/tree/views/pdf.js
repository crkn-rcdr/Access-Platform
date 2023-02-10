module.exports = {
  map: function (doc) {
    var type = "none";
    if ("type" in doc) {
      type = doc.type;
    }

    var hasFile = "none";
    if (typeof doc.file == "object") {
      if ("extension" in doc.file) {
        hasFile = doc.file.extension;
      } else if ("path" in doc.file) {
        hasFile = "path";
      } else {
        hasFile = "oops";
      }
    }

    var hasOcrPdf = "none";
    if (typeof doc.ocrPdf == "object") {
      if ("extension" in doc.ocrPdf) {
        hasOcrPdf = doc.ocrPdf.extension;
      } else if ("path" in doc.ocrPdf) {
        hasOcrPdf = "path";
      } else {
        hasOcrPdf = "oops";
      }
    }

    emit([type, hasOcrPdf, hasFile], doc.slug);
  },
  reduce: "_count",
};
