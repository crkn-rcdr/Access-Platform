module.exports = {
  map: function (doc) {
    if ("reposManifestDate" in doc) {
      // Seems that Date.parse doesn't support this RFC 3339 date format, so using regexp
      var mandateParse = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/;
      var parsedate = mandateParse.exec(doc["reposManifestDate"]);
      if (parsedate) {
        // first element is the string again, so get rid of it and emit array with each matched element
        parsedate.shift();
        emit(parsedate, null);
      }
    }
  },
  reduce: "_count",
};
