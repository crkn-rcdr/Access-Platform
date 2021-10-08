module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  //const now = Date.now() / 1000;
  const now = new Date().toISOString().replace(/.\d+Z$/g, "Z");

  const { user } = data;

  doc.user = user;
  doc.updated = now;
  delete doc.smelt;

  return successReturn(doc, "ok");
};
