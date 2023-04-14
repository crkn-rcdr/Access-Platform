module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const input = extractJSONFromBody(req);
  if (!input) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  doc = Object.assign(doc, input.data);

  if (input.user) doc.user = input.user;

  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} updated`);
};
