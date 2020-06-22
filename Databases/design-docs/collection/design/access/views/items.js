module.exports = {
  // allows for the lookup of which collections a particular item is in.
  // emits the document slug and label for ease of identifying the collection
  map: function (doc) {
    if ("items" in doc && Array.isArray(doc.items)) {
      doc.items.forEach(function (item) {
        emit(item, { slug: doc.slug, label: doc.label });
      });
    }
  },
};
