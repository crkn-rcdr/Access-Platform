module.exports = {
  map: function (doc) {
    const { parseTimestamp, dateAsArray } = require("views/lib/prelude");

    const update = doc.smelt;
    if (update) {
      const requestDate = parseTimestamp(update.requestDate);
      const processDate = parseTimestamp(update.processDate);
      if (!!update.message && processDate >= requestDate) {
        emit([update.succeeded, ...dateAsArray(processDate)], update.message);
      }
    }
  },
  reduce: "_count",
};
