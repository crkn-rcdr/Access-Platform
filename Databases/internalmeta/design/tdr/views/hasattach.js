module.exports = {
  map: function (doc) {
    if ("_attachments" in doc) {
      Object.keys(doc._attachments).forEach(function (attachment) {
        if (attachment !== "hammer.json") {
          emit(attachment, null);
        }
      });
    }
  },
  reduce: "_count",
};
