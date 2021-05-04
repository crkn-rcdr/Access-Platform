module.exports = {
  map: function (doc) {
    if (Array.isArray(doc.members)) {
      for (const member of doc.members) {
        if ("id" in member) {
          /**
           * Setting _id in the value changes the doc included by
           * include_docs=true to that of the member! Really cool.
           */
          emit(member.id, null);
        }
      }
    }
  },
};
