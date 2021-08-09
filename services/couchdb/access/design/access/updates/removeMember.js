module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateObject,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  if (doc.type !== "collection") {
    return errorReturn(
      `${req.id} is not a collection; cannot remove a member from it`
    );
  }

  const input = extractJSONFromBody(req);
  if (!input) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const removedIndex = doc.members.findIndex(
    (member) => member.id === input.id
  );
  doc.members.splice(removedIndex, 1);

  updateObject(doc, input.user);

  return successReturn(
    doc,
    `${doc.slug ? doc.slug : doc.id} no longer has member ${input.id}`
  );
};
