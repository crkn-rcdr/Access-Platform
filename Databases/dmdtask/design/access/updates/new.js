module.exports = function (doc, req) {
  var data = {};
  var nowdate = new Date();
  // Javascript toISOString() includes parts of a second, which we strip.
  var nowdates = nowdate.toISOString().replace(/\..*Z/, "Z");

  /*

  Creates a new document given a new unique ID.  That ID can be pulled from CouchDB itself.
  This function confirms the ID is unique, so check the return.

  $ curl -X GET http://localhost:5984/_uuids?count=1
  {"uuids":["f529fb5e6bafb438e5a9e034ae00161f"]}
  $ curl -X POST http://localhost:5984/dmdtask/_design/access/_update/new/f529fb5e6bafb438e5a9e034ae00161f
  {}
  $ curl -X POST http://localhost:5984/dmdtask/_design/access/_update/new/f529fb5e6bafb438e5a9e034ae00161f
  {"error": "Document already exists"}

  */
  if (!doc) {
    if ("id" in req && req.id) {
      return [{ _id: req.id, updated: nowdates }, '{"success": true}'];
    } else {
      return [null, '{"error": "Missing ID"}'];
    }
  } else {
    return [null, '{"error": "Document already exists"}'];
  }
};
