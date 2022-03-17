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

  if (items) {
    if (Array.isArray(items)) {
      // array[] -- set items and itemsCount
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
      } else {
        doc.items = items;
        doc.itemsCount = items.length;
      }
    } else if (items === "delete") {
      // "delete" -- remove items and itemsCount
      if ("items" in doc) delete doc.items;
      if ("itemsCount" in doc) delete doc.itemsCount;
    } else {
      // undefined -- don't change
      return errorReturn(`Items value must be either an array or "delete"`);
    }
  }

  doc.process = processUpdate(doc.process, succeeded, message);
  doc.updated = doc.process.processDate;

  return successReturn(doc, `Processed metadata for task ${req.id}`);
};
