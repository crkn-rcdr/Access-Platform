module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    updateObject,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  updateObject(doc);

  const id = doc.slug || doc._id;

  /* Should the label be updated?
  const label = doc.label; */
  return successReturn(doc, `Hammer update forced for ${id}`);
};
