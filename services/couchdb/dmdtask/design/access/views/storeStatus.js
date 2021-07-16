module.exports = {
  map: function (doc) {
    if ("store" in doc && "processDate" in doc.store) {
      datep = doc.store.processDate.split("T");
      emit(
        [doc.store.succeeded, doc.store.message !== "", datep[0], datep[1]],
        doc.store.message
      );
    }
  },
  reduce: "_count",
};
