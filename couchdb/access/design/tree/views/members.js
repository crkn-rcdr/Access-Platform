module.exports = {
  map: function (doc) {
    if (Array.isArray(doc.members) && doc.members.length > 0)
      emit([doc.behavior, doc.members.length], null);
  },
  reduce: "_count",
};
