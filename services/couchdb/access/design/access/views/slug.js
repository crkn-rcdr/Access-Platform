module.exports = {
  map: function (doc) {
    if ("slug" in doc) {
      emit(doc.slug, null);
    }
    if ("extraSlugs" in doc && Array.isArray(doc.extraSlugs)) {
      doc.extraSlugs.forEach((slug) => emit(slug, null));
    }
  },
};
