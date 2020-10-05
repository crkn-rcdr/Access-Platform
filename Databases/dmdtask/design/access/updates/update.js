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
      return [
        null,
        JSON.stringify({ error: "could not parse body: " + req.body }) + "\n",
      ];
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

  // Initiate a split task
  if ("split" in data) {
    // Value of 'split' is ignored, only its existance matters.
    delete doc.items; // Fields from previous split deleted
    delete doc.store;
    doc.split = {}; // Status from previous split cleared
    doc.split.requestDate = nowdates;
    updated = true;
  }

  // Store the response from doing a split
  if ("splitres" in data) {
    var split = JSON.parse(data["splitres"]);
    if (!("requestDate" in split)) {
      if ("split" in doc && "requestDate" in doc.split) {
        split.requestDate = doc.split.requestDate;
      } else {
        split.requestDate = nowdates;
      }
    }
    if (!("processDate" in split)) {
      split.processDate = nowdates;
    }
    if (!("message" in split)) {
      split.message = "";
    }
    doc.split = split;
    updated = true;
  }

  // Initiate a store task
  if ("store" in data) {
    // value of 'store' will be array of objects to copy fields into 'copyto*' fields of items.
    doc.store = {};
    doc.store.requestDate = nowdates;
    updated = true;
  }

  // Store the response from doing a store
  if ("storeres" in data) {
    var store = JSON.parse(data["storeres"]);
    if (!("requestDate" in store)) {
      if ("split" in doc && "requestDate" in doc.store) {
        store.requestDate = doc.store.requestDate;
      } else {
        store.requestDate = nowdates;
      }
    }
    if (!("processDate" in store)) {
      store.processDate = nowdates;
    }
    if (!("message" in store)) {
      store.message = "";
    }
    doc.store = store;
    updated = true;
  }

  if (updated) {
    doc["updated"] = nowdates;
    return [doc, JSON.stringify({ return: "update" }) + "\n"];
  } else {
    return [null, JSON.stringify({ return: "no update" }) + "\n"];
  }
};
