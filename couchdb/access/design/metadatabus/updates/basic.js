module.exports = function (doc, req) {
  var data = {};
  var nowdate = new Date();
  // Javascript toISOString() includes parts of a second, which we strip.
  var nowdates = nowdate.toISOString().replace(/\..*Z/, "Z");
  var updated = false;

  // Note that form data won't work for the values which aren't simple strings
  if (req.form && Object.keys(req.form).length > 0) {
    data = req.form;
  } else {
    try {
      data = JSON.parse(req.body);
    } catch (ignore) {
      return [null, "could not parse body: " + req.body];
    }
  }

  if (!doc) {
    return [null, '{"error": "ID Not found"}\n'];
  }

  if ("makepublic" in data && !("public" in doc)) {
    if (!("updateInternalmeta" in doc)) {
      doc["updateInternalmeta"] = {};
    }
    doc["public"] = nowdates;
    doc["updateInternalmeta"]["requestDate"] = nowdates;
    delete doc["updateInternalmeta"]["processDate"];
    updated = true;
  }
  if ("makeprivate" in data && "public" in doc) {
    if (!("updateInternalmeta" in doc)) {
      doc["updateInternalmeta"] = {};
    }
    delete doc["public"];
    doc["updateInternalmeta"]["requestDate"] = nowdates;
    delete doc["updateInternalmeta"]["processDate"];
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
    // this works?!? what happens if you're updating this with a JSON request body?
    // update: I checked the code. this never gets updated with a JSON request body.
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
    if (!("message" in updateInternalmeta)) {
      updateInternalmeta.message = "";
    }
    doc.updateInternalmeta = updateInternalmeta;
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
};
