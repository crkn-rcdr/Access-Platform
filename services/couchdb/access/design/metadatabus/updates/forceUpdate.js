module.exports = function (doc, req) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  doc.updateInternalmeta = { requestDate: Date.now() / 1000 };

  const id = doc.slug || doc._id;
  return successReturn(doc, `Hammer update forced for ${id}`);
};
