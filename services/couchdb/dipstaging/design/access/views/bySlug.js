module.exports = {
  map: function (doc) {
    if (doc.slug) {
      emit(doc.slug, null);
    }
  },
  reduce: "_count",
};
