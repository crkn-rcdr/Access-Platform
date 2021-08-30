module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    extractJSONFromBody,
  } = require("views/lib/prelude");

  if (doc !== null) {
    return errorReturn(
      "Cannot call this update function on an existing document"
    );
  }

  const input = extractJSONFromBody(req);
  if (!input) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const id = req.uuid;

  const newDoc = {
    _id: id,
    format: input.format,
    user: input.user,
  };

  if ("_attachments" in input) newDoc["_attachments"] = input._attachments;

  return successReturn(newDoc, id);
};
