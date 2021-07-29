module.exports = function (doc, members) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!members)
    return errorReturn(`Expecting request body in second parameter, 'members`);

  doc["members"] = members;

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} members updated`);
};
