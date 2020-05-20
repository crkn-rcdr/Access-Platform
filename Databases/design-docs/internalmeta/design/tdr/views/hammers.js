module.exports = {
  map: function (doc) {
    if ("hammer" in doc) {
      emit(
        [doc.hammer.status, doc.hammer.message !== "", doc.hammer.date],
        doc.hammer.message
      );
    }
  },
  reduce: "_count",
};
