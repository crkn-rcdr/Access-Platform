module.exports = {
  map: function (doc) {
    const getDate = (thing) => {
      if (typeof thing === "number") return new Date(thing * 1000);
      // if parsing fails, e.g. if date is undefined, date === NaN
      const parsed = Date.parse(thing);
      return Number.isNaN(parsed) ? new Date(0) : new Date(parsed);
    };

    const dateAsArray = (date) => {
      return [
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
      ];
    };

    const update = doc.updateInternalmeta;
    if (update) {
      const requestDate = getDate(update.requestDate);
      const processDate = getDate(update.processDate);
      if (!!update.message && processDate >= requestDate) {
        emit([update.succeeded, ...dateAsArray(processDate)], update.message);
      }
    }
  },
  reduce: "_count",
};
