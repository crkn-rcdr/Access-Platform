module.exports = function (doc, behavior) {
  const { successReturn, errorReturn } = require("views/lib/prelude");

  if (!doc) return errorReturn(`No document found with id ${doc.id}`);
  if (!behavior)
    return errorReturn(
      `Expecting request body in second parameter, 'behavior'`
    );

  doc["behavior"] = behavior;

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} behavior updated`);
};
