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

  if (doc.public) {
    return errorReturn(`Trying to publish an object that is already public`);
  }

  const now = Date.now() / 1000;
  doc.public = now;
  doc.updateInternalmeta = { requestDate: now };
  return successReturn(doc, `${doc.slug ? doc.slug : doc.id} published`);
};
