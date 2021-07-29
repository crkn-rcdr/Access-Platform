module.exports = function (doc, pageLabels) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!pageLabels)
    return errorReturn(
      `Expecting request body in second parameter, 'pageLabels`
    );

  doc["pageLabels"] = pageLabels;

  return successReturn(
    doc,
    `${doc.slug ? doc.slug : doc.id} pageLabels updated`
  );
};
