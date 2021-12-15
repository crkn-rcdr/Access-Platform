// Used by Press2
module.exports = {
  map: function (doc) {
    if ("noid" in doc && doc.type !== "page") {
      emit(doc.noid, null);
    }
  },
};
