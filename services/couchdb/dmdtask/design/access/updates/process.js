module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
    processUpdate,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const { succeeded, message, items } = data;

  if (succeeded) {
    if (Array.isArray(items)) {
      const errors = [];
      items.forEach((item, i) => {
        if (item.parsed && !(item.id && item.output && item.label)) {
          errors.push(i);
        }
      });
      if (errors.length) {
        return errorReturn(
          `Parsed items missing required fields: ${errors.join(", ")}`
        );
      }
    } else {
      return errorReturn(`Process succeeded, but is missing items array`);
    }
  }

  doc.process = processUpdate(doc.process, succeeded, message);
  doc.updated = doc.process.processDate;

  return successReturn(doc, `Processed metadata for task ${req.id}`);
};
