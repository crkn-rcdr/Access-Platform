module.exports = function (doc, req) {
    var data = {};
    var nowdate = new Date();
    // Javascript toISOString() includes parts of a second, which we strip.
    var nowdates = nowdate.toISOString().replace(/\..*Z/, "Z");
    var updated = false;
   
    if (Object.keys(req.id).length > 0) {
    try {
      data = JSON.parse(req.body);
    } catch (ignore) {
      return [null, "could not parse body: " + req.body];
    }
    }
    if (!doc) {
    if ("id" in req && req.id) {
      doc = { _id: req.id };
      updated = true;
    } else {
      return [null, '{"error": "Missing ID"}\n'];
    }
    }
    //Deleting the items, Need feedback on this part.
    if ("items" in data) {
        delete doc["items"];
        updated = true;
    }
    var retval = {};
  if (updated) {
    doc["updated"] = nowdates;
    retval["return"] = "update";
    return [doc, JSON.stringify(retval) + "\n"];
  } else {
    retval["return"] = "no update";
    return [null, JSON.stringify(retval) + "\n"];
  }
}