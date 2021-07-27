/**
 * @module
 * Overview:
 * The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.
 *
 * Usage:
 * <Editor bind:object />
 *
 * Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
 */

/**
 *
 * @param arr
 * @param currentIndex
 * @param destinationIndex
 * @returns
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
