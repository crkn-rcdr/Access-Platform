module.exports = {
  map: function(doc) {
    if (
      "sub-type" in doc &&
      doc["sub-type"] === "document" &&
      "canonicalDownload" in doc &&
      doc["canonicalDownload"] === "" &&
      !("canonicalDownloadError" in doc) &&
      doc["_id"].substr(0, 15) !== "oocihm.lac_reel"
    ) {
      emit(null, null);
    }
  }
};
