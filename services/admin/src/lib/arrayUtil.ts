/**
 * @module arrayUtil
 * @description
 * This module contains methods that are useful for manipulating arrays.
 */

/**
 * Moves an element of an array from currentIndex to destinationIndex, and returns the array.
 * @param arr
 * @param currentIndex
 * @param destinationIndex
 * @returns any[]
 */
function moveArrayElement(
  arr: any[],
  currentIndex: number,
  destinationIndex: number
): any[] {
  const item = arr.splice(currentIndex, 1)[0];
  arr.splice(destinationIndex, 0, item);
  return arr;
}
export { moveArrayElement };
