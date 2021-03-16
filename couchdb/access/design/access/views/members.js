module.exports = {
  // allows for the lookup of which collections a particular item is in.
  // emits the document slug and label for ease of identifying the collection
  map: function (doc) {
    if ("members" in doc && Array.isArray(doc.members)) {
      doc.members.forEach(function (member) {
        if ("id" in member && member.id) {
          emit(member.id, null);
        }
      });
    }
  },
};
