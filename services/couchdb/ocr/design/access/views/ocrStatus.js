module.exports = {
  map: function (doc) {
    const { parseTimestamp, dateAsArray } = require("views/lib/prelude");

    var update = doc.exportProcess;
    if (update) {
      const requestDate = parseTimestamp(update.requestDate);
      const processDate = parseTimestamp(update.processDate);
      if (!!update.message && processDate >= requestDate) {
        emit(
          ["export", update.succeeded, ...dateAsArray(processDate)],
          update.message
        );
      }
    }

    update = doc.importProcess;
    if (update) {
      const requestDate = parseTimestamp(update.requestDate);
      const processDate = parseTimestamp(update.processDate);
      if (!!update.message && processDate >= requestDate) {
        emit(
          ["import", update.succeeded, ...dateAsArray(processDate)],
          update.message
        );
      }
    }
  },
  reduce: "_count",
};
