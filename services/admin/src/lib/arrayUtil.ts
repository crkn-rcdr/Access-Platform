function moveArrayElement(
  arr: any[],
  currentIndex: number,
  destinationIndex: number
): any[] {
  while (currentIndex < 0) {
    currentIndex += arr.length;
  }
  while (destinationIndex < 0) {
    destinationIndex += arr.length;
  }
  if (destinationIndex >= arr.length) {
    var k = destinationIndex - arr.length;
    while (k-- + 1) {
      arr.push(undefined);
    }
  }
  arr.splice(destinationIndex, 0, arr.splice(currentIndex, 1)[0]);
  return arr;
}

export { moveArrayElement };
