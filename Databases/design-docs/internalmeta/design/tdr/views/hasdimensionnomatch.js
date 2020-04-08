module.exports = {
  map: function(doc) {
    if (
      "pageinfo" in doc &&
      "dimensions" in doc.pageinfo &&
      doc.pageinfo.dimensions !== doc.pageinfo.count
    ) {
      emit(null, null);
    }
  }
};
