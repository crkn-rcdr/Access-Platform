<script lang="ts">
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import { createEventDispatcher } from "svelte";
  import Align from "../shared/Align.svelte";
  import AutomaticResizeNumberInput from "../shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "../shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "../../lib/arrayUtil";
  import { onMount } from "svelte";

  export let canvases = [];

  let indexModel = [];
  let activeCanvasIndex;
  let listComponent;

  const dispatch = createEventDispatcher();

  function trackIndexes() {
    indexModel = [];
    for (let i = 0; i < canvases.length; i++) {
      indexModel.push(`${i + 1}`);
    }
  }

  function thumbnailClicked(index) {
    activeCanvasIndex = index;
    dispatch("thumbnailClicked", { index });
  }

  function moveCanvas(event, originalItemIndex) {
    let destinationItemIndex = parseInt(event.detail.value) - 1;
    moveArrayElement(canvases, originalItemIndex, destinationItemIndex);
    canvases = canvases;
    let prevIndex = activeCanvasIndex;
    activeCanvasIndex = destinationItemIndex;
    trackIndexes();
    if (Math.abs(prevIndex - activeCanvasIndex) >= 2)
      jumpTo(destinationItemIndex);
    thumbnailClicked(activeCanvasIndex);
  }

  function jumpTo(index) {
    let canvasThumbnails = listComponent.querySelectorAll(".thumbnail");
    canvasThumbnails[index].scrollIntoView();
  }

  // TODO
  /*function copyCanvasByIndex(event, index) {
    event.stopPropagation();
  }*/

  function deleteCanvasByIndex(event, index) {
    event.stopPropagation();
  }

  /*
  Left: 37
Up: 38
Right: 39
Down: 40
  */

  function selectPrevious() {
    if (activeCanvasIndex > 0) {
      activeCanvasIndex--;
      thumbnailClicked(activeCanvasIndex);
      jumpTo(activeCanvasIndex);
    }
  }

  function selectNext() {
    if (activeCanvasIndex < canvases.length - 1) {
      activeCanvasIndex++;
      thumbnailClicked(activeCanvasIndex);
      jumpTo(activeCanvasIndex);
    }
  }

  function handleKeydown(event) {
    if (event.keyCode === 37 || event.keyCode === 38) {
      //go back
      selectPrevious();
    } else if (event.keyCode === 39 || event.keyCode === 40) {
      //go forward
      selectNext();
    }
  }

  onMount(() => {
    if (canvases.length) activeCanvasIndex = 0;
    trackIndexes();
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<div bind:this={listComponent} class="list">
  {#if canvases[activeCanvasIndex]}
    <DynamicDragAndDropList bind:dragList={canvases}>
      {#each canvases as canvas, i}
        {#if i < indexModel.length}
          <div
            class="thumbnail"
            class:active={canvases[activeCanvasIndex]["id"] === canvas["id"]}
            on:click={(e) => thumbnailClicked(i)}
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
                      type="number"
                      name="position"
                      min="1"
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
                <div
                  class="thumbnail-img"
                  style={`background-image: url(https://image-uvic.canadiana.ca/iiif/2/${canvas["id"]}/full/!110,146/0/default.jpg);`}
                />
              </div>
            </Align>
          </div>
        {/if}
      {/each}
    </DynamicDragAndDropList>
  {/if}
</div>

<style>
  .list {
    width: 319px;
    background-color: rgb(235, 235, 235);
    height: 100%;
    overflow-y: auto;
  }

  .thumbnail {
    height: 250px;
    width: 100%;
  }

  .thumbnail:nth-child(1) {
    margin-top: 24px;
  }

  .thumbnail.active {
    background-color: rgb(245 245 245);
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
  .add-button:hover:after {
    content: "";
    position: absolute;
    width: 100%;
    left: 0;
    height: 1px;
    border-bottom: 2px solid grey;
    margin-top: 12px;
    /*border-image: var(--gradient);
    border-image-width: 100%;*/
    opacity: 0.8;
    top: 236px;
  }
  .thumbnail:hover .pos {
    display: none;
  }
  .thumbnail:hover .pos-input {
    display: inherit;
  }
  /*
  1) change to our own images X
  2) Drag and drop on ff opening image
  3) clean everything up
  4) add canvas form other manifest:
  Add canvas as button on top of list - Sticky as you scroll
  opren where selected canvas is: Add canvas -> enter slug, find canvas then add it

  other ideas:

  Jump to page

  Swapping pages 2-4 and 4-2

  */
</style>
