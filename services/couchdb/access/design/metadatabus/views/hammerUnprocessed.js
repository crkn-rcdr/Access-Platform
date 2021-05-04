module.exports = {
  map: function (doc) {
    if (!doc.updateInternalmeta || !doc.updateInternalmeta.processDate) {
      emit(
        [
          doc.slug ? "with slug" : "without slug",
          doc.public ? "public" : "not public",
        ],
        null
      );
    }
  },
  reduce: "_count",
};
