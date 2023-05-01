module.exports = {
  map: function (doc) {
    const progress = doc.progress;
    if (progress) {
      emit(doc._id, progress);
    }
  },
  reduce: "_count",
};
