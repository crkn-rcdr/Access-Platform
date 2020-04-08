module.exports = {
  map: function(doc) {
    if ("pubmin" in doc) {
      emit(doc.pubmin, null);
    }
  },
  reduce: "_count"
};
