module.exports = {
  map: function (doc) {
    if (Array.isArray(doc.memberships)) {
      for (const membership of doc.memberships) {
        if ("of" in membership) {
          emit([membership.of, membership.seq || null, doc.slug || null], null);
        }
      }
    }
  },
};
