<!--
@component
### Overview
A container that enables the dragging and dropping of it's childen elements.

### Properties
|    |    |    |
| -- | -- | -- |
| dragList: any[]                         | required | A list of anything that has the exact same number of elements as the number of children directly under the DynamicDragAndDropList component. It is updated as the elements under DynamicDragAndDropList are dragged around, meaning that if child element of DynamicDragAndDropList at position 'i' is drragged and dropped to position 'j', the draglist item at position 'i' is also moved to position 'j'. |
| direction: ctring, "y" or "x" or "both" | optional | The orientation of the drag list, either vertical (y), horizontal (x), or a grid (both) |

### Usage
**Example one**
```  
<DynamicDragAndDropList
  bind:dragList={items}
  on:itemDropped={(e) => {
    console.logs(e.detail.destinationItemIndex);
  }}
>
  {#each items as item, i}
    <div>
      I am draggable!!!! {i}
    </div>
  {/each}
</DynamicDragAndDropList>
```
*Note: `dragList` must have the same number of elements as the number of children direcly under the DynamicDragAndDropList component.*
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { moveArrayElement } from "$lib/utils/arrayUtil";

  /**
   * @type {string} A list of anything that has the exact same number of elements as the number of children directly under the DynamicDragAndDropList component. It is updated as the elements under DynamicDragAndDropList are dragged around, meaning that if child element of DynamicDragAndDropList at position 'i' is drragged and dropped to position 'j', the draglist item at position 'i' is also moved to position 'j'.
   */
  export let dragList: any[] = []; // TODO: make optional and edit the position of the actual elements array if not set

  /**
   * @type {"y" | "x" | "both"} The orientation of the drag list, either vertical (y), horizontal (x), or a grid (both).
   */
  export let direction: "y" | "x" | "both" = "y"; //

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {HTMLDivElement} The html element holding all of the elements that can be dragged around.
   */
  let container: HTMLDivElement;

  /**
   * @type {number} The index of the element that is being dragged.
   */
  let currentItemIndex: number;

  /**
   * @type {number} The index in the dragList to drop a dragged item to.
   */
  let destinationItemIndex: number;

  /**
   * @type {any[]} A store for the list (dragList) to be used to reset it if a drop fails.
   */
  let originalList: any[] = [];

  /**
   * @type {boolean} If the move was successful.
   */
  let success = false;

  /**
   * If the y coordinate of the element being dragged is greater than or equal to the y coordinate of the rectangle return true otherwise return false (because we are iterating through the rects in decreasing order! This simplifies the calculation)
   * @param rect
   * @param destinationY
   * @returns boolean
   */
  function checkVerticalList(rect: DOMRect, destinationY: number): boolean {
    let y = rect.top;
    return y <= destinationY;
  }

  /**
   * If the x coordinate of the element being dragged is greater than or equal to the x coordinate of the rectangle return true otherwise return false (because we are iterating through the rects in decreasing order! This simplifies the calculation)
   * @param rect
   * @param destinationX
   * @returns boolean
   */
  function checkHorizontalList(rect: DOMRect, destinationX: number): boolean {
    let x = rect.left;
    return x <= destinationX;
  }

  /**
   * If the coordinates of the element being dragged are greater than or equal to the coordinates of the rectangle return true otherwise return false (because we are iterating through the rects in decreasing order! This simplifies the calculation)
   * @param rect
   * @param destinationX
   * @param destinationY
   * @returns boolean
   */
  function checkGrid(
    rect: DOMRect,
    destinationX: number,
    destinationY: number
  ): boolean {
    let y = rect.top;
    let x = rect.left;
    return y <= destinationY && x <= destinationX;
  }

  /**
   * Checks a rect's area representing a valid drop zone against the destination coordinates (of the element being dragged) to see if this rect is the one being hovered over by the item being dragged. Calls @function checkVerticalList or @function checkHorizontalList or @function checkGrid depending on the @var direction
   * @param rect
   * @param destinationX
   * @param destinationY
   * @returns boolean
   */
  function checkIfShouldAddAfterIndex(
    rect: DOMRect | undefined,
    destinationX: number,
    destinationY: number
  ) {
    if (rect) {
      if (direction === "y" && checkVerticalList(rect, destinationY)) {
        return true;
      } else if (direction === "x" && checkHorizontalList(rect, destinationX)) {
        return true;
      } else if (checkGrid(rect, destinationX, destinationY)) {
        return true;
      }
    }
    return false;
  }

  /**
   * When an item enters a valid drop zone, check its coordinates against the coordinates of the other draggable elements to find the index to move the item at @var currentItemIndex in the dragList to
   * @param destinationX
   * @param destinationY
   * @returns number
   */
  function getIndexToMoveChildTo(destinationX: number, destinationY: number) {
    let destinationItemIndex = currentItemIndex;
    for (let i = container.children.length - 1; i >= 0; i--) {
      let rect = container?.children?.[i]?.getBoundingClientRect();
      if (checkIfShouldAddAfterIndex(rect, destinationX, destinationY)) {
        destinationItemIndex = i;
        break;
      }
    }
    return destinationItemIndex;
  }

  /**
   * Takes care of moving the dragged item from @var currentItemIndex to @var destinationItemIndex in @var dragList. Triggers the @event itemDropped that sends out these indexes to the parent in its event.detail
   * @returns void
   */
  function handleMove() {
    if (currentItemIndex === destinationItemIndex) return;
    dragList = moveArrayElement(
      dragList,
      currentItemIndex,
      destinationItemIndex
    );
    dispatch("itemDropped", { currentItemIndex, destinationItemIndex });
    currentItemIndex = destinationItemIndex;
  }

  /**
   * When dragging begins, set the @var currentItemIndex to the index of the element being dragged and keep track of the state of the @var dragList by setting the @var originalList to a copy of it.
   * @param this
   * @param elementIndex
   * @returns void
   */
  function dragStart(this: Element, elementIndex: number) {
    currentItemIndex = elementIndex;
    originalList = [...dragList];
  }

  /**
   * When an item enters a valid drop zone, check its coordinates against the coordinates of the other draggable elements to find the index to move the item at @var currentItemIndex in the dragList to by calling @function getIndexToMoveChildTo. Then call @function handleMove to perform the move.
   * @returns void
   */
  function dragenter(event: any) {
    destinationItemIndex = getIndexToMoveChildTo(event.clientX, event.clientY);
    handleMove();
  }

  /**
   * When a successful drop occurs, set the @var success check to true.
   * @returns void
   */
  function drop() {
    success = true;
  }

  /**
   * When dragging is complete, if the drop wasn't successful, reset @var dragList to the @var originalList. Then, reset the @var success check.
   * @returns void
   */
  function dragend() {
    if (!success) dragList = originalList;
    success = false; // Reset this after each drag operation
  }

  /**
   * Sets the event listers that enable the dragging behaviour for the element passed in, that is at elementIndex in the array of children of it's parent element.
   * @param element
   * @param elementIndex
   * @returns void
   */
  function addEventListeners(element: Element, elementIndex: number) {
    element.addEventListener(
      "dragstart",
      dragStart.bind(element, elementIndex)
    );
    element.addEventListener("dragenter", dragenter);
    element.addEventListener("drop", drop);
    element.addEventListener("dragend", dragend);
  }

  /**
   * Clears the event listers that enable the dragging behaviour for the element passed in, that is at elementIndex in the array of children of it's parent element.
   * @param element
   * @param elementIndex
   * @returns void
   */
  function removeEventListeners(element: Element, elementIndex: number) {
    element.removeEventListener(
      "dragstart",
      dragStart.bind(element, elementIndex)
    );
    element.removeEventListener("dragenter", dragenter);
    element.removeEventListener("drop", drop);
    element.removeEventListener("dragend", dragend);
  }

  /**
   * Sets the event listers and attributes that enable the dragging behaviour for the element passed in, that is at elementIndex in the array of children of it's parent element.
   * @param element
   * @param elementIndex
   * @returns void
   */
  function enableDraggingOnChild(
    element: Element | undefined,
    elementIndex: number
  ) {
    if (typeof element === "undefined") return;
    element.classList?.add("draggable");
    element.setAttribute("draggable", "true");
    element.setAttribute("ondragover", "return false");

    removeEventListeners(element, elementIndex); // Ensure no duplicates fired
    addEventListeners(element, elementIndex);
  }

  /**
   * Iterates over the children of @var container and calls @function enableDraggingOnChild on each one.
   * @returns void
   */
  function enableDraggingOnChildren() {
    if (container) {
      for (let i = 0; i < container.children.length; i++) {
        enableDraggingOnChild(container?.children?.[i], i);
      }
    }
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, enable dragging  by calling @function enableDraggingOnChildren
   */
  onMount(() => {
    enableDraggingOnChildren();
  });

  /**
   * @listens dragList
   * @description Enables dragging any time the dragList is updated by calling @function enableDraggingOnChildren
   */
  $: {
    dragList;
    enableDraggingOnChildren();
  }
</script>

<div class="drag-and-drop-wrap {direction}" bind:this={container}>
  <slot />
</div>

<style>
  .drag-and-drop-wrap {
    min-width: 100%;
  }
  .x {
    overflow-y: hidden;
    overflow-x: auto;
    white-space: nowrap;
  }
  .y {
    overflow-x: hidden;
    overflow-y: auto;
    white-space: nowrap;
  }

  :global(.x .draggable) {
    display: inline-block;
  }
  :global(.both .draggable) {
    display: inline-block;
  }
  :global(.drag-target) {
    opacity: 0.3;
    filter: brightness(0.5);
  }
  :global(.y .drag-target) {
    border-top: 0.25rem solid var(--secondary);
  }
  :global(.x .drag-target) {
    border-left: 0.25rem solid var(--secondary);
  }
  :global(.both .drag-target) {
    border: 0.25rem solid var(--secondary);
  }
  :global(.draggable:hover) {
    filter: brightness(1.03);
    cursor: grab;
  }
</style>
