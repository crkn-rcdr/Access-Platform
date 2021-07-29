module.exports = function (doc, label) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!label)
    return errorReturn(`Expecting request body in second parameter, 'label`);

  doc["label"] = label;

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} label updated`);
};
