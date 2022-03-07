/**
 * As we plan to update the task document to enable the "files updated" status-bar, I would like an update function to simplify this.

Accepts an array such as:

[ [5,true], [6,true], [7,false]]

This is an array of pairs, where the first element in the pair is the array index into items[] , and the boolean is what to put into stored field.

This would bring that specific processing closer to the database. I want to be able to update several at the same time as I'm likely to only update after 50 or 100 changes have been accumulated.
 */
module.exports = function (doc, req) {
  const {
    successReturn,
    errorReturn,
    timestamp,
    extractJSONFromBody,
  } = require("views/lib/prelude");

  if (!doc) {
    return errorReturn(`No document found with id ${req.id}`, 404);
  }

  const input = extractJSONFromBody(req);
  if (!Array.isArray(input)) {
    return errorReturn(`Expected an array as input`);
  }

  for (const itemDataArray of input) {
    if (
      Array.isArray(itemDataArray) &&
      itemDataArray.length === 2 &&
      itemDataArray[0] < doc.items.length
    ) {
      doc.items[itemDataArray[0]].stored = itemDataArray[1];
    }
  }

  const now = timestamp();
  doc.updated = now;

  return successReturn(doc, "ok");
};
