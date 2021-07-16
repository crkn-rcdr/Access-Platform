module.exports = {
  map: function (doc) {
    if ("split" in doc && "processDate" in doc.split) {
      datep = doc.split.processDate.split("T");
      emit(
        [doc.split.succeeded, doc.split.message !== "", datep[0], datep[1]],
        doc.split.message
      );
    }
  },
  reduce: "_count",
};
