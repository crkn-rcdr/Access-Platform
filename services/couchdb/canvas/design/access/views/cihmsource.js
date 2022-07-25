module.exports = {
  map: function (doc) {
    if (
      typeof doc.source == "object" &&
      typeof doc.master == "object" &&
      doc.source.from === "cihm"
    ) {
      if ("md5" in doc.source) {
        emit([doc.source.path, doc.source.size, doc.source.md5], null);
      } else {
        emit([doc.source.path, doc.master.size, doc.master.md5], null);
      }
    }
  },
  reduce: "_count",
};
