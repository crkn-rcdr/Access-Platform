module.exports = {
  map: function (doc) {
    const { parseTimestamp, dateAsArray } = require("views/lib/prelude");

    const update = doc.ocr;
    if (update) {
      const requestDate = parseTimestamp(update.requestDate);
      const processDate = parseTimestamp(update.processDate);
      if (processDate < requestDate) {
        emit(dateAsArray(requestDate), null);
      }
    }
  },
  reduce: "_count",
};
