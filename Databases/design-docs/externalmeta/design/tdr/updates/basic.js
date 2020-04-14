module.exports = function(doc, req) {
  var nowdate = new Date();
  // Javascript toISOString() includes parts of a second, which we strip.
  var nowdates = nowdate.toISOString().replace(/\..*Z/, "Z");
  var updated = false;
  if (!doc) {
    if ("id" in req && req["id"]) {
      // create new document
      doc = {};
      doc["_id"] = req["id"];
      doc["document date"] = nowdates;
      updated = true;
    } else {
      // change nothing in database
      return [null, '{"error": "Missing ID"}\n'];
    }
  }
  if (updated) {
    return [doc, '{"return": "update"}\n'];
  } else {
    return [null, '{"return": "no update"}\n'];
  }
};
