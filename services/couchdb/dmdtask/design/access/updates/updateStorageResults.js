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

  const data = extractJSONFromBody(req);
  if (!data) {
    return errorReturn(`Could not parse request body as JSON: ${req.body}`);
  }

  /*
  An array as an optional parameter - [ [5,true], [6,true], [7,false]]
  workProgress - an integer (index into array or index+1 -- your choice) for where the microservice is in paging through the work to do
  workSize - an integer (size of array) for the work array. */
  const { array, workProgress, workSize } = data;

  if (array) {
    for (const itemDataArray of array) {
      if (
        Array.isArray(itemDataArray) &&
        itemDataArray.length === 2 &&
        itemDataArray[0] < doc.items.length
      ) {
        doc.items[itemDataArray[0]].stored = itemDataArray[1];
      }
    }
  }

  if (typeof workProgress !== "undefined" && typeof workSize !== "undefined") {
    doc.progress =
      workSize > 0 ? Math.floor((workProgress / workSize) * 100) : 0;
  }

  const now = timestamp();
  doc.updated = now;

  return successReturn(doc, "ok");
};
