<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import { moveArrayElement } from "$lib/arrayUtil";

  export let dragList: any[] = [];
  export let direction = "y"; // y | x | both

  const dispatch = createEventDispatcher();

  let container: HTMLDivElement;
  let originalItemIndex: number;
  let destinationItemIndex: number;

  function handleDrop() {
    if (originalItemIndex === destinationItemIndex) return;
    dragList = moveArrayElement(
      dragList,
      originalItemIndex,
      destinationItemIndex
    );
    dispatch("itemDropped", { originalItemIndex, destinationItemIndex });
  }

  function checkVerticalList(rect: DOMRect, destinationY: number): boolean {
    let y = rect.top;
    return y <= destinationY;
  }

  function checkHorizontalList(rect: DOMRect, destinationX: number): boolean {
    let x = rect.left;
    return x <= destinationX;
  }

  function checkGrid(
    rect: DOMRect,
    destinationX: number,
    destinationY: number
  ): boolean {
    let y = rect.top;
    let x = rect.left;
    return y <= destinationY && x <= destinationX;
  }

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

  function getIndexToMoveChildTo(destinationX: number, destinationY: number) {
    let destinationItemIndex = originalItemIndex;

    for (let i = container.children.length - 1; i >= 0; i--) {
      let rect = container?.children?.[i]?.getBoundingClientRect();
      if (checkIfShouldAddAfterIndex(rect, destinationX, destinationY)) {
        destinationItemIndex = i;
        break;
      }
    }

    return destinationItemIndex;
  }

  function setDragAnimation() {
    for (let i = 0; i < container.children.length; i++) {
      if (i === destinationItemIndex) {
        container?.children?.[i]?.classList?.add("drag-target");
      } else {
        container?.children?.[i]?.classList?.remove("drag-target");
      }
    }
  }

  function clearDragAnimation() {
    for (let i = 0; i < container.children.length; i++) {
      container?.children?.[i]?.classList?.remove("drag-target");
    }
  }

  function enableDraggingOnChild(
    element: Element | undefined,
    elementIndex: number
  ) {
    if (typeof element === "undefined") return;
    element.classList?.add("draggable");
    element.setAttribute("draggable", "true");
    element.setAttribute("ondragover", "return false");

    /** Hides the item being dragged in it's orginal position. This must be done during drag, else the drag preview will not show. */
    element.addEventListener("drag", () => {
      element.classList?.add("dragging");
    });

    /** When the dragging begins, record the items current index for moving upon drop */
    element.addEventListener("dragstart", () => {
      originalItemIndex = elementIndex;
    });

    /** Shows the item being dragged in it's new position, and clears the drag target animation from the element being hovered over. */
    element.addEventListener("dragend", () => {
      element.classList?.remove("dragging");
      clearDragAnimation();
    });

    /** Disables the drag animation when the component being dragged is no longer over an element */
    element.addEventListener("dragleave", () => {
      clearDragAnimation();
    });

    /** Records the destination index for moving the dragged item to, and adds the drag target animation from the element being hovered over. */
    element.addEventListener("dragover", (event: any) => {
      destinationItemIndex = getIndexToMoveChildTo(
        event.clientX,
        event.clientY
      );
      setDragAnimation();
    });
  }

  function enableDraggingOnChildren() {
    if (container) {
      for (let i = 0; i < container.children.length; i++) {
        enableDraggingOnChild(container?.children?.[i], i);
      }
    }
  }

  onMount(() => {
    enableDraggingOnChildren();
  });

  $: {
    dragList;
    enableDraggingOnChildren();
  }
</script>

<div
  class="drag-and-drop-wrap {direction}"
  bind:this={container}
  on:drop={handleDrop}
>
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

  :global(.x .draggable, .both .draggable) {
    display: inline-block;
  }
  :global(.drag-target) {
    opacity: 0.3;
    filter: brightness(0.5);
  }
  :global(.y .drag-target) {
    border-top: 0.25rem solid var(--grey);
  }
  :global(.x .drag-target) {
    border-left: 0.25rem solid var(--grey);
  }
  :global(.both .drag-target) {
    border: 0.25rem solid var(--grey);
  }
  :global(.draggable:hover) {
    filter: brightness(1.03);
    cursor: grab;
  }
  :global(.dragging) {
    visibility: hidden !important;
  }
</style>
