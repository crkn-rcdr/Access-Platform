module.exports = {
  map: function (doc) {
    const { parseTimestamp, dateAsArray } = require("views/lib/prelude");

    if (doc.reposManifestDate && doc.smelt) {
      const requestDate = parseTimestamp(doc.smelt.requestDate);
      const processDate = parseTimestamp(doc.smelt.processDate);
      const reposManifestDate = parseTimestamp(doc.reposManifestDate);

      if (
        requestDate &&
        reposManifestDate &&
        processDate &&
        reposManifestDate > processDate &&
        processDate > requestDate
      ) {
        emit(dateAsArray(parseTimestamp(doc.reposManifestDate)), null);
      }
    }
  },
  reduce: "_count",
};
