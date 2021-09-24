module.exports = function (doc, req) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  if (typeof doc.staff === "object") {
    delete doc.staff;
  }

  return successReturn(
    doc,
    `${doc.slug ? doc.slug : doc.id} no longer has a staff object`
  );
};
