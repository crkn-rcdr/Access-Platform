module.exports = {
  map: function (doc) {
    const { parseTimestamp, dateAsArray } = require("views/lib/prelude");

    const update = doc.createOCRPDF;
    if (update) {
      const requestDate = parseTimestamp(update.requestDate);
      const processDate = parseTimestamp(update.processDate);
      if (!!update.message && processDate >= requestDate) {
        var type = "other";
        if (update.message.includes("413 - Request Entity Too Large")) {
          type = "Too Large";
        } else if (update.message.includes("Not all canvases have OCR data")) {
          type = "Not All";
        }
        emit(
          [update.succeeded, type, ...dateAsArray(processDate)],
          update.message
        );
      }
    }
  },
  reduce: "_count",
};
