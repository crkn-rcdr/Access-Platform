// Used by Press2
module.exports = {
  map: function (doc) {
    if ("manifest_noid" in doc) {
      emit(doc.manifest_noid, null);
    }
  },
};
