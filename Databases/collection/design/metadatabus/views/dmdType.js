module.exports = {
  map: function (doc) {
    emit(doc.dmdType, null);
  },
  reduce: "_count",
};
