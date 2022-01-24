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

  if (doc.public) {
    return errorReturn(`Trying to publish an object that is already public`);
  }

  if (!doc.dmdType) {
    return errorReturn(`Descriptive Metadata missing`);
  }

  const user = extractJSONFromBody(req);

  const now = timestamp();
  doc.public = now;

  updateObject(doc, user);

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} published`);
};
