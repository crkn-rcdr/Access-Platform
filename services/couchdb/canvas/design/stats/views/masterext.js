module.exports = {
  map: function (doc) {
    if (typeof doc.master == "object") {
      var ext;
      if ("extension" in doc.master) {
        ext = doc.master.extension;
      } else {
        ext = "none";
      }
      emit(ext, null);
    }
  },
  reduce: "_count",
};
