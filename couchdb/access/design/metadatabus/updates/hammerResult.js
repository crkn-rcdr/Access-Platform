module.exports = function (doc, req) {
  const successReturn = (doc, message) => {
    return [doc, JSON.stringify({ message }) + "\n"];
  };

  const errorReturn = (message) => {
    return [null, JSON.stringify({ error: message }) + "\n"];
  };

  const extractData = (req) => {
    try {
      // seems like "" and "undefined" are valid strings for an empty req.body
      return ["", "undefined"].includes(req.body)
        ? undefined
        : JSON.parse(req.body);
    } catch (ignore) {
      return null;
    }
  };

  if (!doc) {
    return errorReturn(`No document found with id ${doc.id}`);
  }

  const data = extractData(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  const now = Date.now() / 1000;
  doc.updateInternalmeta = {
    requestDate: doc.updateInternalmeta
      ? doc.updateInternalmeta.requestDate
      : now,
    processDate: now,
    succeeded: !!data.succeeded,
    message: data.message,
  };

  return successReturn(
    doc,
    `Updated ${
      doc.slug ? doc.slug : doc.id
    } with the results of a Hammer operation`
  );
};
