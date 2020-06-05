module.exports = {
  map: function (doc) {
    if ("smelt" in doc && "processDate" in doc["smelt"]) {
      datep = doc.smelt.processDate.split("T");
      emit(
        [doc.smelt.succeeded, doc.smelt.message !== "", datep[0], datep[1]],
        null
      );
    }
  },
  reduce: "_count",
};
