module.exports = {
  map: function (doc) {
    if ("press" in doc) {
      emit(
        [doc.press.status, doc.press.message !== "", doc.press.date],
        doc.press.message
      );
    }
  },
  reduce: "_count",
};
