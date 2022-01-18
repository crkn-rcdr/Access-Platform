module.exports = {
  map: function (doc) {
    const { parseTimestamp, dateAsArray } = require("views/lib/prelude");

    var process = doc.exportProcess;
    if (process) {
      const requestDate = parseTimestamp(process.requestDate);
      const processDate = parseTimestamp(process.processDate);
      if (processDate < requestDate) {
        emit(["export", ...dateAsArray(requestDate)], null);
      }
    }

    process = doc.importProcess;
    if (process) {
      const requestDate = parseTimestamp(process.requestDate);
      const processDate = parseTimestamp(process.processDate);
      if (processDate < requestDate) {
        emit(["import", ...dateAsArray(requestDate)], null);
      }
    }
  },
  reduce: "_count",
};
