module.exports = function (doc, canvases) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!canvases)
    return errorReturn(`Expecting request body in second parameter, 'canvases`);

  doc["canvases"] = canvases;

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} canvases updated`);
};
