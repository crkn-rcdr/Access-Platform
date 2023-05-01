module.exports = {
  map: function (doc) {
    let fileName = doc.fileName ? doc.fileName : "";
    let date = 0;
    let count = doc.items ? doc.items.length : 0;
    let message = "";
    let type = "queued";
    if (doc.process) {
      if (doc.process.processDate) {
        date = doc.process.processDate;
        if (doc.process.message) message = doc.process.message;
        type = "completed"
      } else if (doc.process.requestDate) {
        date = doc.process.requestDate;
      }
    }

    emit(doc._id, {
      fileName,
      date,
      count,
      message,
      type
    });
  },
  reduce: "_count",
};
