module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  doc = Object.assign(doc, data);

  const now = Date.now() / 1000;
  doc.updateInternalmeta = { requestDate: now };
  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} updated`);
};
