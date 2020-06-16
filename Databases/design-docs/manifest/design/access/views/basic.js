module.exports = {
  // emit very basic data in value, to avoid having to load giant canvas lists
  // when doing large lookups
  map: function (doc) {
    emit(doc._id, {
      slug: doc.slug,
      label: doc.label,
      public: doc.public,
      type: doc.type,
    });
  },
};
