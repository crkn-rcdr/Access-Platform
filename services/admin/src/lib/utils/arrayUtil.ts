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

async function marshallArrayMethod(
  arr: any[],
  startIndex: number,
  count: number,
  method
) {
  let endIndex = startIndex + count;
  if (endIndex > arr.length) endIndex = arr.length;

  let responses = [];
  while (true) {
    console.log(startIndex, endIndex, arr.length);
    const subArr = arr.slice(startIndex, endIndex);
    responses.push(await method(subArr));
    startIndex += count;
    if (endIndex === arr.length) break;
    else endIndex += count;
    if (endIndex > arr.length) endIndex = arr.length;
  }

  return responses;
}

export { moveArrayElement, marshallArrayMethod };
