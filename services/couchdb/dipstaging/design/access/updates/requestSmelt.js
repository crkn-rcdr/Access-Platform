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

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const { user, slug } = data;

  updateGenericObject(doc, user);

  if (typeof slug === "string") {
    doc.slug = slug;
  }

  const now = timestamp();
  doc.smelt = { requestDate: now };

  return successReturn(doc, "ok");
};
