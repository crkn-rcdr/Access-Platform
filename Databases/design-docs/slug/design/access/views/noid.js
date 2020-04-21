module.exports = {
  map: function(doc) {
    if ("noid" in doc) {
      emit(doc.noid, null);
    }
  }
};
