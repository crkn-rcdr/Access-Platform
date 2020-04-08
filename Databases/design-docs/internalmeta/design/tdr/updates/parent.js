module.exports = function(doc, req) {
  if (!doc) {
    // Parents must already exist
    return [null, '{"return": "not found"}\n'];
  }

  var nowdate = new Date();
  // Javascript toISOString() includes parts of a second, which we strip.
  var nowdates = nowdate.toISOString().replace(/\..*Z/, "Z");
  doc["updatereq"] = nowdates;
  doc["updated"] = nowdates;

  var resp = {
    headers: {
      "Content-Type": "application/json"
    },
    body: toJSON({
      label: doc["label"],
      collection: doc["collections"],
      return: "updated"
    })
  };
  return [doc, resp];
};
