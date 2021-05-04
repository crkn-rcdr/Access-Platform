module.exports = {
  map: function (doc) {
    if ("slug" in doc) {
      emit(doc.slug, null);
    }
  },
};
