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

  if (!doc.public) {
    return errorReturn(`Trying to unpublish an object that isn't public`);
  }

  const user = extractJSONFromBody(req);
  if (!user) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  delete doc.public;

  updateObject(doc, user);

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} unpublished`);
};
