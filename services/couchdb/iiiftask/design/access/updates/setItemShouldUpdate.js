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

  const { index, value } = input;

  if (typeof index !== "number" && typeof value !== "boolean")
    return errorReturn(`Index must be a number, value must be a boolean`);

  if (typeof doc.items !== "undefined") {
    if (index >= 0 && index < doc.items.length) {
      // do
      doc.items[index].shouldStore = value;
    } else {
      return errorReturn(
        `Index greater than items array length or less than zero.`
      );
    }
  }

  return successReturn(doc, `item updated`);
};
