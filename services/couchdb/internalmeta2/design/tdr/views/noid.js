// Temporary during transition to merging Hammer2 and Press2
module.exports = {
  map: function (doc) {
    if ("noid" in doc) {
      emit(doc.noid, null);
    }
  },
};
