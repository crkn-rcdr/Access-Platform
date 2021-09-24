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

  if (doc.public) {
    return errorReturn(`Trying to publish an object that is already public`);
  }

  const user = extractJSONFromBody(req);

  const now = Date.now() / 1000;
  doc.public = now;

  updateObject(doc, user);

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} published`);
};
