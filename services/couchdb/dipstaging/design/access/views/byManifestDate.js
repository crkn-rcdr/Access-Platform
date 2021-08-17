module.exports = {
  map: function (doc) {
    const { parseTimestamp, dateAsArray } = require("views/lib/prelude");

    if (doc.reposManifestDate) {
      emit(dateAsArray(parseTimestamp(doc.reposManifestDate)), null);
    }
  },
  reduce: "_count",
};
