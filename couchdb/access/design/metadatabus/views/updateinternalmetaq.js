module.exports = {
  map: function (doc) {
    const getDate = (date) => {
      if (typeof date === "number") return new Date(date * 1000);
      // if parsing fails, e.g. if date is undefined, date === NaN
      const parsed = Date.parse(date);
      return Number.isNaN(parsed) ? new Date(0) : new Date(parsed);
    };

    const update = doc.updateInternalmeta;
    if (update) {
      const requestDate = getDate(update.requestDate);
      const processDate = getDate(update.processDate);
      if (processDate < requestDate) {
        emit(
          [
            requestDate.getUTCFullYear(),
            requestDate.getUTCMonth() + 1,
            requestDate.getUTCDate(),
            requestDate.getUTCHours(),
            requestDate.getUTCMinutes(),
            requestDate.getUTCSeconds(),
          ],
          null
        );
      }
    }
  },
  reduce: "_count",
};
