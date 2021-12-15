// Looked, but couldn't find any code using this.  Remove?
module.exports = {
  map: function (doc) {
    if ("canonicalMaster" in doc) {
      emit(doc.canonicalMaster, null);
    }
    if ("canonicalDownload" in doc) {
      emit(doc.canonicalDownload, null);
    }
  },
};
