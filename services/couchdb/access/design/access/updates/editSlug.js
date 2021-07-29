module.exports = function (doc, slug) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!slug)
    return errorReturn(`Expecting request body in second parameter, 'slug`);

  doc["slug"] = slug;

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} slug updated`);
};
