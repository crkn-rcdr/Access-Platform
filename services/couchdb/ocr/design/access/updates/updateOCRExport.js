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
  if (!("exportProcess" in doc)) {
    doc.exportProcess = { requestDate: now };
  }

  doc.exportProcess.succeeded = Boolean(succeeded);

  if (typeof processDate === "string") {
    doc.exportProcess.processDate = processDate;
  } else {
    doc.exportProcess.processDate = now;
  }

  if (typeof message === "string") {
    doc.exportProcess.message = message;
  } else {
    delete doc.exportProcess.message;
  }

  return successReturn(doc, "ok");
};
