module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    timestamp,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const now = timestamp();

  doc.updated = now;
  doc.validationProcess = { requestDate: now };

  return successReturn(doc, "ok");
};
