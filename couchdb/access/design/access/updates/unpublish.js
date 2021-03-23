module.exports = function (doc) {
  const successReturn = (doc, message) => {
    return [doc, JSON.stringify({ message }) + "\n"];
  };

  const errorReturn = (message) => {
    return [null, JSON.stringify({ error: message }) + "\n"];
  };

  if (!doc) {
    return errorReturn(`No document found with id ${doc.id}`);
  }

  if (!doc.public) {
    return errorReturn(`Trying to unpublish an object that isn't public`);
  }

  delete doc.public;
  doc.updateInternalmeta = { requestDate: Date.now() / 1000 };
  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} unpublished`);
};
