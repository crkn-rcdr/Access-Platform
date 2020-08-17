module.exports = {
    map: function (doc) {
      if ("dmdType" in doc) {
        emit(doc.dmdType, null);
      }
    },
    reduce: "_count",
  };