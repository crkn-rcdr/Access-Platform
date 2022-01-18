module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    updateObject,
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
  updateObject(doc, user);

  const now = timestamp();
  if (!("importProcess" in doc)) {
    doc.importProcess = { requestDate: now };
  }

  doc.importProcess.succeeded = Boolean(succeeded);

  if (typeof processDate === "string") {
    doc.importProcess.processDate = processDate;
  } else {
    doc.importProcess.processDate = now;
  }

  if (typeof message === "string") {
    doc.importProcess.message = message;
  } else {
    delete doc.importProcess.message;
  }

  return successReturn(doc, "ok");
};
