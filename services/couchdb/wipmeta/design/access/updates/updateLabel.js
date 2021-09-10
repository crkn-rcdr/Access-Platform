module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const input = extractJSONFromBody(req);
  if (!input) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  if ("label" in input) {
    doc.label = input.label;
    doc.updated = new Date().toISOString().split(".")[0] + "Z";
  }

  // The tests will run when i say dev
  // Chances are the samples we were given have already processed.
  // Kivik service running - if put a file in a fixtures folder it should notice and create it - if no validator it should throw it in.
  // Restart the service.
  // updateObject(doc);
  // Timestamp
  // get rid of the the .000 seconds and add the Z

  return successReturn(doc, `Label updated for ${doc.id}`);
};
