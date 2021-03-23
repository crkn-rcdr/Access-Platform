module.exports = {
  // emit for slugs and aliases
  map: function (doc) {
    if ("slug" in doc) {
      emit(doc.slug, null);
    }
  },
};
