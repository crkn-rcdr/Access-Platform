<script lang="ts">
  import { moveArrayElement } from "../../lib/arrayUtil";
  import { onMount } from "svelte";

  export let dragList: any[] = [];
  export let direction = "y"; // y | x | both

  let container: HTMLDivElement;
  let originalItemIndex: number;
  let destinationItemIndex: number;

  function handleDrop() {
    clearDragAnimation();
    dragList = moveArrayElement(
      dragList,
      originalItemIndex,
      destinationItemIndex
    );
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

  function enableDragging(element: Element | undefined, elementIndex: number) {
    if (typeof element === "undefined") return;
    element.classList?.add("draggable");
    element.setAttribute("draggable", "true");
    element.setAttribute("ondragover", "return false");
    element.addEventListener("dragstart", () => {
      originalItemIndex = elementIndex;
    });
    element.addEventListener("dragover", (event: any) => {
      destinationItemIndex = getIndexToMoveChildTo(
        event.clientX,
        event.clientY
      );
      setDragAnimation();
    });
  }

  onMount(() => {
    for (let i = 0; i < container.children.length; i++) {
      enableDragging(container?.children?.[i], i);
    }
  });
</script>

<div class="drag-and-drop-wrap" bind:this={container} on:drop={handleDrop}>
  <slot />
</div>

<style>
  .drag-and-drop-wrap {
    width: 100%;
  }
  :global(.drag-target) {
    opacity: 0.3;
    filter: brightness(0.5);
  }
  :global(.drag-target::before) {
    display: inline-block;
    content: "";
    border-top: 2px solid var(--grey);
    width: 100%;
    margin: 0;
    transform: translateY(-1rem);
  }
  :global(.draggable:hover) {
    filter: brightness(1.03);
    cursor: grab;
  }
</style>
