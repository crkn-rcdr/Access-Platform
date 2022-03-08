module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateGenericObject,
    timestamp,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  if (doc.type !== "manifest") {
    return errorReturn(`${req.id} is not a manifest`);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const { user } = data;
  updateGenericObject(doc, user);

  const now = timestamp();
  doc.renderingTask = { requestDate: now };

  return successReturn(doc, "ok");
};
