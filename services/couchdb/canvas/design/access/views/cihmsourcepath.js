module.exports = {
  map: function (doc) {
    if (typeof doc.source == "object" && doc.source.from === "cihm") {
      emit(doc.source.path, null);
    }
  }
};
