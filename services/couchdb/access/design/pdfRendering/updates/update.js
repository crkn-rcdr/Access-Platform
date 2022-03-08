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

  const { rendering, succeeded, message } = data;

  const now = timestamp();
  const then = doc.renderingTask ? doc.renderingTask.requestDate : now;

  doc.renderingTask = {
    requestDate: then,
    processDate: now,
    succeeded,
    message,
  };

  if (succeeded) {
    doc.rendering = rendering;

    doc.updateInternalmeta = {
      requestDate: now,
    };
  }

  return successReturn(doc, "ok");
};
