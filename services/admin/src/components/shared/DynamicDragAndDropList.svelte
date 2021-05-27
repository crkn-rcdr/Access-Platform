<script>
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
            //if (i === originalItemIndex) continue;

            var rect = container.children[i].getBoundingClientRect();

            if (direction === "y") {
                let y = rect.top;
                console.log(y < destinationY, y, destinationY);
                if (y <= destinationY) {
                    destinationItemIndex = i;
                }
            } else if (direction === "x") {
                let x = rect.left;
                if (x <= destinationX) {
                    destinationItemIndex = i;
                }
            } else {
                let y = rect.top;
                let x = rect.left;
                if (y <= destinationY && x <= destinationX) {
                    destinationItemIndex = i;
                }
            }
        }
        return destinationItemIndex;
    }

    function moveArrayElement(arr, currentIndex, destinationIndex) {
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
                console.log("Dragged child", i);
                originalItemIndex = i;
            });
            container.children[i].addEventListener("dragover", (event) => {
                console.log("Dragged child", i);

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
        opacity: 0.1;
        filter: brightness(0.5);
    }
    :global(.drag-target::before) {
        display: inline-block;
        content: "";
        border-top: 2px solid black;
        width: 100%;
        margin: 0;
        transform: translateY(-1.5rem);
    }
    :global(.draggable:hover) {
        filter: brightness(1.1);
        cursor: grab;
    }
</style>
