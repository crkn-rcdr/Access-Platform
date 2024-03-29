module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateObject,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const user = extractJSONFromBody(req);

  const slug = doc.slug;
  delete doc.slug;

  updateObject(doc, user);

  return successReturn(doc, `${slug} is no longer assigned to ${doc.id}`);
};
