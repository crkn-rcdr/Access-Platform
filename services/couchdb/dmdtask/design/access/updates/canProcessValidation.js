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
  if (input && input.user) doc.user = input.user;

  const now = timestamp();
  doc.updated = now;
  doc.process = { requestDate: now };

  return successReturn(doc, "ok");
};
