module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateObject,
    timestamp,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  if (!doc.exportProcess || !doc.exportProcess.succeeded) {
    return errorReturn(
      `Can not import an ocr batch that has not been exported ${req.id}`,
      404
    );
  }

  const { user } = data;
  updateObject(doc, user);

  const now = timestamp();
  doc.importProcess = { requestDate: now };

  return successReturn(doc, "ok");
};
