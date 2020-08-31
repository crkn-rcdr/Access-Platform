module.exports = {
  // emit for slugs and aliases
  map: function (doc) {
    if ("slug" in doc) {
      emit(doc.slug, {
        label: doc.label,
        isAlias: false,
        public: "public" in doc,
      });

      if ("aliasedSlugs" in doc && Array.isArray(doc.aliasedSlugs)) {
        doc.aliasedSlugs.forEach(function (slug) {
          emit(slug, {
            label: doc.label,
            isAlias: true,
            aliasOf: doc.slug,
            public: "public" in doc,
          });
        });
      }
    }
  },
};
