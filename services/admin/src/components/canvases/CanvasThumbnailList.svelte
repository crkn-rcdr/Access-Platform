<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../shared/Align.svelte";
  import AutomaticResizeNumberInput from "../shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "../shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "../../lib/arrayUtil";

  export let canvases: Canvas[] = [];

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
    console.log(indexModel);
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

  onMount(() => {
    if (canvases.length) activeCanvasIndex = 0;
    setIndexModel();
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if indexModel.length}
  <button class="primary" on:click={(e) => {}}>Add Canvas</button>
  <div bind:this={container} tabindex="0" class="list">
    <DynamicDragAndDropList bind:dragList={canvases}>
      {#each canvases as canvas, i}
        <div
          class="thumbnail"
          class:active={isActive(canvas)}
          on:click={() => setActiveIndex(i)}
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
                src={`https://image-uvic.canadiana.ca/iiif/2/${canvas["id"]}/full/!110,146/0/default.jpg`}
              />
            </div>
          </Align>
        </div>
      {/each}
    </DynamicDragAndDropList>
  </div>
{/if}

<style>
  .list {
    height: 92%;
    width: 100%;
    overflow-y: auto;
  }

  button.primary {
    width: 100%;
  }

  .thumbnail {
    height: 250px;
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
    margin-left: 24px;
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
    margin-top: 24px;
  }

  .image-wrap .thumbnail-img {
    height: 200px;
    width: 150px;
    margin: 0 20px;
    background-size: 100% 100%;
    pointer-events: none;
  }

  .pos {
    font-weight: 400;
    margin-top: 9px;
    margin-left: 9px;
    font-size: 16px;
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
