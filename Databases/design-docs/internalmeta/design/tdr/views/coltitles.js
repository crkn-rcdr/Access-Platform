module.exports = {
  map: function(doc) {
    if (!("parent" in doc) && "approved" in doc) {
      if ("collections" in doc && Array.isArray(doc.collections)) {
        if (doc.collections.length === 0) {
          emit("[empty]", null);
        } else {
          doc.collections.forEach(function(thiscol) {
            emit(thiscol, null);
          });
        }
      } else {
        emit("[none]", null);
      }
    }
  },
  reduce: "_count"
};
