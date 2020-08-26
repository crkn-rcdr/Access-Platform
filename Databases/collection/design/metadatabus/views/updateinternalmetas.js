module.exports = {
  map: function (doc) {
    if ("updateInternalmeta" in doc && "processDate" in doc.updateInternalmeta) {
      datep = doc.updateInternalmeta.processDate.split("T");
      emit(
        [doc.updateInternalmeta.succeeded, doc.updateInternalmeta.message !== "", datep[0], datep[1]],
        null
      );
    }
  },
  reduce: "_count",
};
