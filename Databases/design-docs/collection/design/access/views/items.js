module.exports = {
  // Map includes aliases and document ID's for single lookup.
  map: function (doc) {
    if ("items" in doc && Array.isArray(doc.items)) {
      doc.items.forEach(function (item) {
        emit(item, null);
      });
    }
  },
};
