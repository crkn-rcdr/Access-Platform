module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateObject,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const input = extractJSONFromBody(req);
  if (!input) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  if ("_attachments" in input) doc._attachments = input._attachments;

  updateObject(doc);

  return successReturn(doc, `${doc.id} metadata updated.`);
};
