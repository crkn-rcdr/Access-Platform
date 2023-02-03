module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateGenericObject,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const { user } = data;
  updateGenericObject(doc, user);

  delete doc.createOCRPDF;

  return successReturn(doc, "ok");
};
