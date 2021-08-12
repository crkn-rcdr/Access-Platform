module.exports = function (doc, req) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const now = Date.now() / 1000;

  doc.updated = now;
  doc.process = { requestDate: now };

  return successReturn(doc, "ok");
};
