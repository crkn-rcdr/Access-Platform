module.exports = {
  map: function(doc) {
    if ("pageinfo" in doc && "count" in doc.pageinfo) {
      if ("collections" in doc && Array.isArray(doc.collections)) {
        doc.collections.forEach(function(thiscol) {
          emit(thiscol, doc.pageinfo.count);
        });
      } else {
        emit("[none]", doc.pageinfo.count);
      }
    }
  },
  reduce: "_sum"
};
