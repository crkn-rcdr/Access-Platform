module.exports = {
  map: function(doc) {
    if (
      "type" in doc &&
      doc["type"] === "document" &&
      "order" in doc &&
      Array.isArray(doc["order"])
    ) {
      var pages = doc.order.length;
      if ("collection" in doc && Array.isArray(doc.collection)) {
        doc.collection.forEach(function(thiscol) {
          emit(thiscol, pages);
        });
      } else {
        emit("[none]", pages);
      }
    }
  },
  reduce: "_sum"
};
