module.exports = function (doc, req) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!req) return errorReturn(`Expecting request body in second parameter`);
  if (!req["members"])
    return errorReturn(`Expecting request body to have parameter 'members'`);

  doc["members"] = req["members"];

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} members updated`);
};
