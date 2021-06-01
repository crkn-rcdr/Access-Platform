<script>
  import { moveArrayElement } from "../../lib/arrayUtil";
  import { onMount } from "svelte";

  export let dragList = [];
  export let direction = "y"; // y | x | both

  let container;
  let originalItemIndex;
  let destinationItemIndex;

  function handleDrop(event) {
    clearDragAnimation();
    dragList = moveArrayElement(
      dragList,
      originalItemIndex,
      destinationItemIndex
    );
  }

  function getIndexToMoveChildTo(destinationX, destinationY) {
    let destinationItemIndex = originalItemIndex;
    for (let i = 0; i < container.children.length; i++) {
      var rect = container.children[i].getBoundingClientRect();

      if (direction === "y") {
        let y = rect.top;
        if (y <= destinationY) {
          destinationItemIndex = i;
        }
      } else if (direction === "x") {
        //TODO: test
        let x = rect.left;
        if (x <= destinationX) {
          destinationItemIndex = i;
        }
      } else {
        //TODO: test
        let y = rect.top;
        let x = rect.left;
        if (y <= destinationY && x <= destinationX) {
          destinationItemIndex = i;
        }
      }
    }
    return destinationItemIndex;
  }

  function setDragAnimation() {
    for (let i = 0; i < container.children.length; i++) {
      if (i === destinationItemIndex) {
        container.children[i].classList.add("drag-target");
      } else {
        container.children[i].classList.remove("drag-target");
      }
    }
  }

  function clearDragAnimation() {
    for (let i = 0; i < container.children.length; i++) {
      container.children[i].classList.remove("drag-target");
    }
  }

  onMount(() => {
    console.log("items:", container.children);
    for (let i = 0; i < container.children.length; i++) {
      container.children[i].classList.add("draggable");
      container.children[i].setAttribute("draggable", true);
      container.children[i].addEventListener("dragstart", (event) => {
        originalItemIndex = i;
      });
      container.children[i].addEventListener("dragover", (event) => {
        destinationItemIndex = getIndexToMoveChildTo(
          event.clientX,
          event.clientY
        );
        setDragAnimation();
      });
    }
  });
</script>

<div
  bind:this={container}
  on:drop={(event) => handleDrop(event)}
  ondragover="return false"
>
  <slot />
</div>

<style>
  :global(.drag-target) {
    opacity: 0.3;
    filter: brightness(0.5);
  }
  :global(.drag-target::before) {
    display: inline-block;
    content: "";
    border-top: 2px solid black;
    width: 100%;
    margin: 0;
    transform: translateY(-1rem);
  }
  :global(.draggable:hover) {
    filter: brightness(1.03);
    cursor: grab;
  }
</style>
