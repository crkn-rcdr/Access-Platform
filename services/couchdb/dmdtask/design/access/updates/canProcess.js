module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    timestamp,
    extractJSONFromBody,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const input = extractJSONFromBody(req);

  // Passing in nothing is allowed
  if (input) {
    // Set if there is a 'user' parameter. Must follow User.js schema
    if (input.user) doc.user = input.user;

    // If there is a 'parse' parameter, trigger re-parse of "metadata" attachment.
    if (input.parse) {
      delete doc.items;
      delete doc.itemsCount;
    }
  }

  const now = timestamp();

  doc.updated = now;
  doc.process = { requestDate: now };

  // Clear these from a potential previous run
  delete doc.progress;
  delete doc.workProgress;
  delete doc.workSize;

  return successReturn(doc, "ok");
};
