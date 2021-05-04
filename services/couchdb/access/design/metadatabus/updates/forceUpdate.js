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

  doc.updateInternalmeta = { requestDate: Date.now() / 1000 };
  return successReturn(doc, `Hammer update forced`);
};
