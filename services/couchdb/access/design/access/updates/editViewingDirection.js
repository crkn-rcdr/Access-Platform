module.exports = function (doc, viewingDirection) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!viewingDirection)
    return errorReturn(
      `Expecting request body in second parameter, 'viewingDirection`
    );

  doc["viewingDirection"] = viewingDirection;

  return successReturn(
    doc,
    `${doc.slug ? doc.slug : doc.id} viewingDirection updated`
  );
};
