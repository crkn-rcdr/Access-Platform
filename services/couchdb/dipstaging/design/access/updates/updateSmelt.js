module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateGenericObject,
    timestamp,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const { user, processDate, succeeded, message } = data;

  updateGenericObject(doc, user);

  const now = timestamp();
  if (!("smelt" in doc)) {
    doc.smelt = { requestDate: now };
  }

  doc.smelt.succeeded = Boolean(succeeded);

  if (typeof processDate === "string") {
    doc.smelt.processDate = processDate;
  } else {
    doc.smelt.processDate = now;
  }

  if (typeof message === "string") {
    doc.smelt.message = message;
  } else {
    delete doc.smelt.message;
  }

  return successReturn(doc, "ok");
};
