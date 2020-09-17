// Emit collection regardless of type (series or document, titles and issues)

module.exports = {
  map: function (doc) {
    if ("collections" in doc && Array.isArray(doc.collections)) {
      if (doc.collections.length === 0) {
        emit("[empty]", null);
      } else {
        doc.collections.forEach(function (thiscol) {
          emit(thiscol, null);
        });
      }
    } else {
      emit("[none]", null);
    }
  },
  reduce: "_count",
};
