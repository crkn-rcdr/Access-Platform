<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "$lib/components/shared/Align.svelte";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "$lib/arrayUtil";

  export let canvases: Canvas[] = [];
  export let showAddButton = true;

  let indexModel: number[] = [];
  let activeCanvasIndex: number = 0;
  let container: HTMLDivElement;

  const LEFT_ARROW_CODE: number = 37;
  const UP_ARROW_CODE: number = 38;
  const RIGHT_ARROW_CODE: number = 39;
  const DOWN_ARROW_CODE: number = 40;

  const dispatch = createEventDispatcher();

  function setIndexModel() {
    indexModel = [];
    for (let i = 0; i < canvases.length; i++) {
      indexModel.push(i + 1);
    }
  }

  function setActiveIndex(index: number) {
    activeCanvasIndex = index;
    dispatch("thumbnailClicked", { index });
  }

  function jumpTo(index: number) {
    let canvasThumbnails = container.querySelectorAll(".thumbnail");
    canvasThumbnails?.[index]?.scrollIntoView();
  }

  function deleteCanvasByIndex(event: any, index: number) {
    event.stopPropagation();
    if (index >= 0 && index < canvases.length) {
      canvases.splice(index, 1);
      canvases = canvases;
      setActiveIndex(activeCanvasIndex);
    }
  }

  function moveCanvas(event: any, originalItemIndex: number) {
    // Move the canvas and trigger saving
    let destinationItemIndex = parseInt(event.detail.value) - 1;
    moveArrayElement(canvases, originalItemIndex, destinationItemIndex);
    canvases = canvases;

    // Update the position inputs
    setIndexModel();

    // Highlight and move to new position
    activeCanvasIndex = destinationItemIndex;
    jumpTo(activeCanvasIndex);
    setActiveIndex(activeCanvasIndex);
  }

  function selectPrevious() {
    if (activeCanvasIndex > 0) {
      activeCanvasIndex--;
      jumpTo(activeCanvasIndex);
      setActiveIndex(activeCanvasIndex);
    }
  }

  function selectNext() {
    if (activeCanvasIndex < canvases.length - 1) {
      activeCanvasIndex++;
      jumpTo(activeCanvasIndex);
      setActiveIndex(activeCanvasIndex);
    }
  }

  function handleKeydown(event: any) {
    if (event.keyCode === LEFT_ARROW_CODE || event.keyCode === UP_ARROW_CODE) {
      selectPrevious();
    } else if (
      event.keyCode === RIGHT_ARROW_CODE ||
      event.keyCode === DOWN_ARROW_CODE
    ) {
      selectNext();
    }
  }

  function isActive(canvas: Canvas): boolean {
    if (canvas) {
      return canvases?.[activeCanvasIndex]?.["id"] === canvas["id"];
    }
    return false;
  }

  function addClicked() {
    dispatch("addClicked");
  }

  onMount(() => {
    if (canvases.length) activeCanvasIndex = 0;
    setIndexModel();
  });

  $: {
    canvases;
    setIndexModel();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if indexModel.length}
  <Align vertical="flex-start" direction="column">
    {#if showAddButton}
      <button class="primary" on:click={addClicked}>Add Canvas</button>
    {/if}
    <div
      bind:this={container}
      tabindex="0"
      class="list"
      class:disabled={!showAddButton}
    >
      <DynamicDragAndDropList
        bind:dragList={canvases}
        on:itemDropped={(e) => {
          setActiveIndex(e.detail.destinationItemIndex);
        }}
      >
        {#each canvases as canvas, i}
          <div
            class="thumbnail"
            class:active={isActive(canvas)}
            on:mousedown={() => setActiveIndex(i)}
          >
            <Align vertical="flex-start">
              <div class="actions-wrap">
                <Align vertical="flex-start" direction="column">
                  <div class="action pos">
                    {indexModel[i]}
                  </div>
                  <div
                    class="action pos-input"
                    on:click={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <AutomaticResizeNumberInput
                      name="position"
                      max={canvases.length}
                      on:changed={(e) => {
                        moveCanvas(e, i);
                      }}
                      bind:value={indexModel[i]}
                    />
                  </div>
                  <div
                    class="action icon"
                    on:click={(e) => deleteCanvasByIndex(e, i)}
                  >
                    <TiTrash />
                  </div>
                </Align>
              </div>
              <div class="image-wrap">
                <img
                  alt={canvas["label"]["value"]}
                  class="thumbnail-img"
                  src={`https://image-uvic.canadiana.ca/iiif/2/${encodeURIComponent(
                    canvas["id"]
                  )}/full/!220,292/0/default.jpg`}
                />
              </div>
            </Align>
          </div>
        {/each}
      </DynamicDragAndDropList>
    </div>
  </Align>
{/if}

<style>
  .list {
    position: relative;
    flex: 9;
    width: 100%;
    overflow-y: auto;
  }
  .list.disabled {
    overflow-y: hidden;
  }
  .list.disabled::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.8;
    background: black;
  }

  button.primary {
    width: 100%;
  }

  .thumbnail {
    height: max(22vh, 15rem);
    width: 100%;
    background-color: var(--structural-div-bg);
    overflow: hidden;
  }

  .thumbnail:nth-child(1) {
    margin-top: 0px;
  }

  .thumbnail.active {
    filter: brightness(1.1);
  }

  .actions-wrap {
    flex: 1;
    margin-left: 1.5rem;
  }

  .action.icon {
    opacity: 0.6;
    cursor: pointer;
  }

  .image-wrap {
    flex: 4;
  }

  .actions-wrap,
  .image-wrap {
    margin-top: 1.5rem;
  }

  .image-wrap .thumbnail-img {
    height: max(18vh, 200px);
    width: max(13vh, 150px);
    margin: 0 1.25rem;
    pointer-events: none;
  }

  .pos {
    font-weight: 400;
    margin-top: 0.58rem;
    margin-left: 0.58rem;
  }

  .action.icon {
    display: none;
    margin-top: 0.5em;
  }
  .pos-input {
    display: none;
  }

  .thumbnail:hover .action.icon {
    display: inherit;
  }

  .thumbnail:hover .pos {
    display: none;
  }

  .thumbnail:hover .pos-input {
    display: inherit;
  }
</style>
