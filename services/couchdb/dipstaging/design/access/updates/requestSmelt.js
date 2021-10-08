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

  const now = new Date().toISOString().replace(/.\d+Z$/g, "Z");
  //Date.now() / 1000;

  const { user, slug } = data;

  doc.user = user;
  doc.slug = slug;
  doc.updated = now;
  doc.smelt = { requestDate: now };

  return successReturn(doc, "ok");
};
