/**
 * Generates a well-formed return value for a successful update function invocation.
 * @param {Record<string, string>} doc The updated document.
 * @param {string} message A message describing the successful update.
 * @returns {[Record<string, string>, { message: string }]} An array that can be returned by an update function.
 */
exports.successReturn = (doc, message) => {
  return [doc, JSON.stringify({ message }) + "\n"];
};

/**
 * Generates a well-formed return value for an unsuccessful update function invocation.
 * @param {string} message A message describing the error that prevented the update.
 * @returns {[null, { error: string }]} An array that can be returned by an update function.
 */
exports.errorReturn = (message) => {
  return [null, JSON.stringify({ error: message }) + "\n"];
};

// TODO: use more correct types for this
/**
 * Extracts the JSON from an update request body.
 * @param {{body: string}} req Update function request object.
 * @returns {any} The extracted JSON value.
 */
exports.extractJSONFromBody = (req) => {
  try {
    // seems like "" and "undefined" are valid strings for an empty req.body
    return ["", "undefined"].includes(req.body)
      ? undefined
      : JSON.parse(req.body);
  } catch (ignore) {
    return null;
  }
};

// TODO: use the data type here
/**
 * Parses a Timestamp into a Date.
 * @param {number | string} timestamp The Timestamp -- either UNIX epoch seconds or an ISO 8601-style string.
 * @returns {Date} A Date object for the Timestamp.
 */
exports.parseTimestamp = (timestamp) => {
  if (typeof timestamp === "number") return new Date(timestamp * 1000);
  // if parsing fails, e.g. if date is undefined, date === NaN
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? new Date(0) : new Date(parsed);
};

/**
 * Converts a Date into a numerical array that can be used to sort view keys.
 * @param {Date} date The Date.
 * @returns {[number,number,number,number,number,number]} An array of the form [year, month, day, hours, minutes, seconds]. The month is 1-indexed.
 */
exports.dateAsArray = (date) => {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ];
};
