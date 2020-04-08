module.exports = {
  map: function(doc) {
    if ("hammer" in doc) {
      emit(
        [doc.hammer.status, doc.hammer.message !== "", doc.hammer.date],
        null
      );
    }
  },
  reduce: "_count"
};
