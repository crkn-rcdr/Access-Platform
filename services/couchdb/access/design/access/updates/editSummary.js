module.exports = function (doc, summary) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!summary)
    return errorReturn(`Expecting request body in second parameter, 'summary`);

  doc["summary"] = summary;

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} summary updated`);
};
