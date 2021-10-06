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

  if (!doc.memberships || !Array.isArray(doc.memberships)) doc.memberships = [];

  /**
   * Input should be a membership record, which looks like:
   * { of: Noid, seq?: int, label?: TextRecord }
   */
  doc.memberships.push(input);

  return successReturn(
    doc,
    `${doc.slug ? doc.slug : doc.id} has had its memberships updated`
  );
};
