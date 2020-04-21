module.exports = {
  // Map includes aliases and document ID's for single lookup.
  map: function (doc) {
    if ('aliases' in doc && Array.isArray(doc.aliases)) {
      doc.aliases.forEach(function(thisalias) {
        emit(thisalias, null);
      });
    };
    emit(doc._id,null);
  }
};
