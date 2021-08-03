module.exports = function (doc, req) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  if (!doc.public) {
    return errorReturn(`Trying to unpublish an object that isn't public`);
  }

  delete doc.public;
  doc.updateInternalmeta = { requestDate: Date.now() / 1000 };
  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} unpublished`);
};
