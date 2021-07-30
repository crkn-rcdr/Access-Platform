<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { moveArrayElement } from "$lib/arrayUtil";

  /**
   * @type {string} Slug being resolved.
   */
  export let dragList: any[] = [];

  /**
   * @type {string} Slug being resolved.
   */
  export let direction = "y"; // y | x | both

  /**
   * @type {string} Slug being resolved.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {string} Slug being resolved.
   */
  let container: HTMLDivElement;

  /**
   * @type {string} Slug being resolved.
   */
  let currentItemIndex: number;

  /**
   * @type {string} Slug being resolved.
   */
  let destinationItemIndex: number;

  /**
   * @type {string} Slug being resolved.
   */
  let originalList: any[] = [];

  /**
   * @type {string} Slug being resolved.
   */
  let success = false;

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function checkVerticalList(rect: DOMRect, destinationY: number): boolean {
    let y = rect.top;
    return y <= destinationY;
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function checkHorizontalList(rect: DOMRect, destinationX: number): boolean {
    let x = rect.left;
    return x <= destinationX;
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function dragStart(this: Element, elementIndex: number) {
    currentItemIndex = elementIndex;
    originalList = [...dragList];
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function dragenter(event: any) {
    destinationItemIndex = getIndexToMoveChildTo(event.clientX, event.clientY);
    handleMove();
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function drop() {
    success = true;
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function dragend() {
    if (!success) dragList = originalList;
    success = false; // Reset this after each drag operation
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function enableDraggingOnChildren() {
    if (container) {
      for (let i = 0; i < container.children.length; i++) {
        enableDraggingOnChild(container?.children?.[i], i);
      }
    }
  }

  /**
   *
   * @event onMount
   * @description
   */
  onMount(() => {
    enableDraggingOnChildren();
  });

  /**
   * @listens arr
   * @description
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
