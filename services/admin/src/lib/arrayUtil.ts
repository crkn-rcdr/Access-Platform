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
