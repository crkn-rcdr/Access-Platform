module.exports = {
  map: function(doc) {
    if ("METS" in doc && Array.isArray(doc.METS) && doc.METS.length !== 0) {
      var path = doc.METS[doc.METS.length - 1].path;
      if (path !== "data/sip/data/metadata.xml") {
        emit(path, null);
      }
    }
  },
  reduce: "_count"
};
