module.exports = {
  map: function (doc) {
    const { parseTimestamp, dateAsArray } = require("views/lib/prelude");

    if (
      doc.reposManifestDate &&
      doc.smelt &&
      doc.smelt.processDate &&
      parseTimestamp(doc.reposManifestDate) >
        parseTimestamp(doc.smelt.processDate)
    ) {
      emit(dateAsArray(parseTimestamp(doc.reposManifestDate)), null);
    }
  },
  reduce: "_count",
};
