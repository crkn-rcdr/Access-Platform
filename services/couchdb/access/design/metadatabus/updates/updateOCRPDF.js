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

  const { user, processDate, succeeded, message, ocrPdf } = data;

  updateGenericObject(doc, user);

  const now = timestamp();
  if (!("createOCRPDF" in doc)) {
    doc.createOCRPDF = { requestDate: now };
  }

  doc.createOCRPDF.succeeded = Boolean(succeeded);

  if (ocrPdf != null && typeof ocrPdf === "object") {
    doc.ocrPdf = ocrPdf;
  }

  if (typeof processDate === "string") {
    doc.createOCRPDF.processDate = processDate;
  } else {
    doc.createOCRPDF.processDate = now;
  }

  if (typeof message === "string") {
    doc.createOCRPDF.message = message;
  } else {
    delete doc.createOCRPDF.message;
  }

  return successReturn(doc, "ok");
};
