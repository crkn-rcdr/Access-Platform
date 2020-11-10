module.exports = function (doc, req) {
     var data = {};
     var nowdate = new Date();
  // Javascript toISOString() includes parts of a second, which we strip.
     var nowdates = nowdate.toISOString().replace(/\..*Z/, "Z");
     var updated = false;
    
  if (!doc) {
    if ("id" in req && req.id) {
     doc = { _id: req.id };
      updated = true;
    } else {
      return [null, '{"error": "Missing ID"}\n'];
    }
  }
  if ("slug" in data) {
    delete doc["slug"]
    updated = true;
  } 
  
  if ("public" in data) {
    delete doc["public"]
    updated = true;
  } 
   if ("doupdateInternalmeta" in data) {
    if (!("updateInternalmeta" in doc)) {
      doc["updateInternalmeta"] = {};
    }
    doc["updateInternalmeta"]["requestDate"] = nowdates;
    delete doc["updateInternalmeta"]["processDate"];
    updated = true;
  }

  if ("updateInternalmeta" in data) {
    var updateInternalmeta = JSON.parse(data["updateInternalmeta"]);
    if (!("requestDate" in updateInternalmeta)) {
      if (
        "updateInternalmeta" in doc &&
        "requestDate" in doc.updateInternalmeta
      ) {
        updateInternalmeta.requestDate = doc.updateInternalmeta.requestDate;
      } else {
        updateInternalmeta.requestDate = nowdates;
      }
    }
    if (!("processDate" in updateInternalmeta)) {
      updateInternalmeta.processDate = nowdates;
    }
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
  };