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

  if (!doc.canvases || !doc.canvases.length) {
    return errorReturn(`No canvases to ocr for batch id ${req.id}`, 404);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const { user } = data;
  updateObject(doc, user);

  const now = timestamp();
  doc.exportProcess = { requestDate: now };

  return successReturn(doc, "ok");
};
