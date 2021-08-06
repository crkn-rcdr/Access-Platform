module.exports = function (doc) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`Expecting a valid document`);
  //TEST MANIFEST
  return successReturn(
    doc,
    `${doc.slug ? doc.slug : doc.id} manifest inserted.`
  );
};
