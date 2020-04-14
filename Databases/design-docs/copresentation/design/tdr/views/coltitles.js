module.exports = {
  map: function(doc) {
    if (
      !("pkey" in doc) &&
      "collection" in doc &&
      Array.isArray(doc.collection)
    ) {
      doc.collection.forEach(function(thiscol) {
        emit([thiscol, "updated" in doc ? doc["updated"] : null], null);
      });
    }
  },
  reduce: "_count"
};
