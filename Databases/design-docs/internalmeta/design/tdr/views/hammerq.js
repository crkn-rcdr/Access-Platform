module.exports = {
  map: function(doc) {
    if (
      "METSManifestDate" in doc &&
      "METS" in doc &&
      Array.isArray(doc.METS) &&
      doc.METS.length !== 0
    ) {
      if (
        "hammer" in doc &&
        doc.hammer["manifestdate"] === doc.METSManifestDate
      ) {
        return;
      }
      emit(doc["METSDate"], {
        manifestdate: doc.METSManifestDate,
        path: doc.METS[doc.METS.length - 1].path
      });
    }
  },
  reduce: "_count"
};
