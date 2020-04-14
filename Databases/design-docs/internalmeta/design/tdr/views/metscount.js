module.exports = {
  map: function(doc) {
    var attach = 0;
    if ("METS" in doc && Array.isArray(doc.METS)) {
      attach = doc.METS.length;
    }
    emit(attach, null);
  },
  reduce: "_count"
};
