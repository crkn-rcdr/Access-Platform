module.exports = function (doc, req) {
  var data = {};
  var nowdate = new Date();
  // Javascript toISOString() includes parts of a second, which we strip.
  var nowdates = nowdate.toISOString().replace(/\..*Z/, "Z");
  var updated = false;

  /*

    Updates specific fields in document, always ensuring the "updated" field is updated.
  
    */

  if (!doc) {
    if ("id" in req && req.id) {
      return [null, '{"error": "Document not found"}'];
    } else {
      return [null, '{"error": "Missing ID"}'];
    }
  }

  // Note that form data won't work for the values which aren't simple strings
  var data = {};
  if (req.form && Object.keys(req.form).length > 0) {
    data = req.form;
  } else {
    try {
      data = JSON.parse(req.body);
    } catch (ignore) {
      return [null, "could not parse body: " + req.body];
    }
  }

  if ("depositor" in data && doc.depositor !== data.depositor) {
    doc["depositor"] = data["depositor"];
    updated = true;
  }
  if ("mdtype" in data && doc.mdtype !== data.mdtype) {
    doc["mdtype"] = data["mdtype"];
    updated = true;
  }
  if ("mdname" in data && doc.mdname !== data.mdname) {
    doc["mdname"] = data["mdname"];
    updated = true;
  }
  if ("split" in data) {
    delete doc.items;
    doc.split = {};
    doc.split.requestDate = nowdates;
    updated = true;
  }
  if ("store" in data) {
    // value of 'store' will be array of values to copy into 'copyto' field of items.
    // Values of array will be "access","preservation" or undefined (meaning no store)
    doc.store = {};
    doc.store.requestDate = nowdates;
    updated = true;
  }
  if (updated) {
    doc["updated"] = nowdates;
    return [doc, JSON.stringify({ return: "update" }) + "\n"];
  } else {
    return [null, JSON.stringify({ return: "no update" }) + "\n"];
  }
};
