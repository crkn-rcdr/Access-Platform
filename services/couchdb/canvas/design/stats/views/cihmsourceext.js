module.exports = {
  map: function (doc) {
    if (typeof doc.source == "object" && doc.source.from === "cihm") {
      var ext;
      if (typeof doc.source.path == "string") {
        ext = doc.source.path.split(".").pop();
      } else {
        ext = "none";
      }
      emit(ext, null);
    }
  },
  reduce: "_count",
};
