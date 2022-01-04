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
  if (!("ocr" in doc)) {
    doc.ocr = { requestDate: now };
  }

  doc.ocr.succeeded = Boolean(succeeded);

  if (typeof processDate === "string") {
    doc.ocr.processDate = processDate;
  } else {
    doc.ocr.processDate = now;
  }

  if (typeof message === "string") {
    doc.ocr.message = message;
  } else {
    delete doc.ocr.message;
  }

  return successReturn(doc, "ok");
};
