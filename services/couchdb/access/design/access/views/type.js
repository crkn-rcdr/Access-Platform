module.exports = {
  map: function (doc) {
    if (!doc._id.startsWith("_design")) {
      emit(doc.type || "none", null);
    }
  },
};
