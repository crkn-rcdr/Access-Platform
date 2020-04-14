module.exports = {
  map: function(doc) {
    // For now looking for item_repository documents which need to be replicated
    if (!("label" in doc)) {
      emit(false, null);
    } else if (
      !(typeof doc.label === "string" || doc.label instanceof String) ||
      doc.label.length < 2
    ) {
      emit(true, doc.label);
    }
  },
  reduce: "_count"
};
