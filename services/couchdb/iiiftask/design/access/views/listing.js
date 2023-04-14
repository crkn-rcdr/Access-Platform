module.exports = {
  map: function (doc) {
    let fileName = doc.fileName ? doc.fileName : "";
    let date = 0;
    let count = doc.itemsCount ? doc.itemsCount : 0;
    let message = "";

    if (doc.process) {
      if (doc.process.processDate) {
        date = doc.process.processDate;
        if (doc.process.message) message = doc.process.message;
      } else if (doc.process.requestDate) {
        date = doc.process.requestDate;
      }
    }

    emit(doc._id, {
      fileName,
      date,
      count,
      message,
    });
  },
  reduce: "_count",
};
