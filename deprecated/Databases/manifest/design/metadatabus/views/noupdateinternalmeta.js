module.exports = {
  map: function (doc) {
    if (
      !("updateInternalmeta" in doc) ||
      !("processDate" in doc.updateInternalmeta)
    ) {
      emit(["slug" in doc, "public" in doc], doc.slug);
    }
  },
  reduce: "_count",
};
