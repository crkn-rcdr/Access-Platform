module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    timestamp,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const now = timestamp();
  doc.updateInternalmeta = {
    requestDate: doc.updateInternalmeta
      ? doc.updateInternalmeta.requestDate
      : now,
    processDate: now,
    succeeded: !!data.succeeded,
    message: data.message,
  };

  const id = doc.slug || doc._id;
  return successReturn(
    doc,
    `Updated ${id} with the results of a Hammer operation`
  );
};
