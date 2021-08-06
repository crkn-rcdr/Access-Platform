import { MangoSelector } from "nano";

/**
 * Returns `${str}\uFFF0`. Useful when trying to find all strings that start with `str`.
 * @param str A lookup string, which can serve as the range start.
 */
export const stringRangeEnd = (str: string): string => {
  return `${str}\uFFF0`;
};

/**
 * Returns a Mango selector that finds results where `field` is equal to `value`.
 */
export const mangoEqualSelector = <FieldValue>(
  field: string,
  value: FieldValue
): MangoSelector => {
  if (field === "id") field = "_id";
  // Thanks to ComputedPropertyName
  // https://262.ecma-international.org/6.0/#sec-object-initializer
  return { [field]: { $eq: value } };
};

/**
 * Returns a Mango selector that finds results where `field` equals or starts with the string `value`.
 */
export const mangoStringRangeSelector = (
  field: string,
  value: string
): MangoSelector => {
  if (field === "id") field = "_id";
  return { [field]: { $gte: value, $lt: stringRangeEnd(value) } };
};
