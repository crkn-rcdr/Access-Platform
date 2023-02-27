module.exports = {
  map: function (doc) {
    var ocrType;
    if ("ocrType" in doc) {
      ocrType = doc.ocrType;
    } else {
      ocrType = "none";
    }
    emit(ocrType, null);
  },
  reduce: "_count",
};
