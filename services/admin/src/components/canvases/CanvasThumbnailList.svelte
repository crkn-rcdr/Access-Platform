<script lang="ts">
  import TiTabsOutline from "svelte-icons/ti/TiTabsOutline.svelte";
  import TiDocumentAdd from "svelte-icons/ti/TiDocumentAdd.svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import { createEventDispatcher } from "svelte";
  import Align from "../shared/Align.svelte";
  import AutomaticResizeNumberInput from "../shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "../shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "../../lib/arrayUtil";
  import { onMount } from "svelte";

  let testColours = ["#586BA4", "#F5DD90", "#F68E5F", "#F76C5E", "#CBE896"];
  export let canvases = [];

  let indexModel = [];
  let activeCanvas;
  let listComponent;

  const dispatch = createEventDispatcher();

  function trackIndexes() {
    indexModel = [];
    for (let i = 0; i < canvases.length; i++) {
      indexModel.push(i + 1);
    }
  }

  function thumbnailClicked(event, index, canvas) {
    activeCanvas = canvas;
    dispatch("thumbnailClicked", { index });
  }

  function moveCanvas(event, originalItemIndex) {
    let destinationItemIndex = parseInt(event.detail.value) - 1;
    moveArrayElement(canvases, originalItemIndex, destinationItemIndex);
    canvases = canvases;
    activeCanvas = canvases[destinationItemIndex];
    trackIndexes();
    jumpTo(destinationItemIndex);
    dispatch("thumbnailClicked", { index: destinationItemIndex });
  }

  function jumpTo(index) {
    let canvasThumbnails = listComponent.querySelectorAll(".thumbnail");
    if (index >= 0 && index < canvasThumbnails.length)
      canvasThumbnails[index].scrollIntoView();
  }

  // TODO
  function copyCanvasByIndex(event, index) {
    event.stopPropagation();
  }

  function deleteCanvasByIndex(event, index) {
    event.stopPropagation();
  }

  function addCanvasAfterIndex(event, index) {
    event.stopPropagation();
  }

  onMount(() => {
    if (canvases.length) activeCanvas = canvases[0];
    trackIndexes();

    for (let i = 0; i < canvases.length; i++) {
      canvases[i]["colour"] = testColours[i];
    }
  });
</script>

<div bind:this={listComponent} class="list">
  {#if activeCanvas}
    <DynamicDragAndDropList bind:dragList={canvases}>
      {#each canvases as canvas, i}
        {#if i < indexModel.length}
          <div
            class="thumbnail"
            class:active={activeCanvas["id"] === canvas["id"]}
            on:click={(e) => thumbnailClicked(e, i, canvas)}
          >
            <Align vertical="flex-start">
              <div class="actions-wrap">
                <Align vertical="flex-start" direction="column">
                  <div
                    class="action"
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
                    on:click={(e) => copyCanvasByIndex(e, i)}
                  >
                    <TiTabsOutline />
                  </div>

                  <div
                    class="action icon add-button"
                    on:click={(e) => addCanvasAfterIndex(e, i)}
                  >
                    <TiDocumentAdd />
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
                <!--some content would be nice {canvas["id"]}-->
                <!--img
                  class="thumbnail-img"
                  src="https://i.pinimg.com/originals/9e/7b/d3/9e7bd39f635900028cd26596cbda365a.jpg"
                /-->
                <div
                  class="thumbnail-img"
                  style={`background:${canvas["colour"]}`}
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
    width: 361px;
    background-color: rgb(235, 235, 235);
    height: 100%;
    overflow-y: auto;
  }

  .thumbnail {
    height: 250px;
    width: 100%;
    margin: auto;
    margin-bottom: 24px;
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
    margin-top: 0.5em;
    width: 28px;
    height: 28px;
    opacity: 0.6;
    cursor: pointer;
  }

  .image-wrap {
    flex: 9;
    text-align: center;
  }

  .actions-wrap,
  .image-wrap {
    margin-top: 24px;
  }

  .image-wrap .thumbnail-img {
    height: 200px;
    width: 150px;
    margin: auto;
  }

  .action.icon {
    display: none;
  }

  .thumbnail:hover .action.icon {
    display: inherit;
  }
  .add-button:hover:after {
    content: "";
    position: absolute;
    width: 99%;
    left: 0;
    height: 1px;
    border-bottom: 2px solid grey;
    margin-top: 12px;
    /*border-image: var(--gradient);
    border-image-width: 100%;*/
    opacity: 0.8;
    top: 248px;
  }

  /*.add-button {
    margin-top: 52px !important;
    margin-top: 58px !important;
  }*/

  /*.add-button {
    visibility: hidden;
    margin-top: 52px !important;
    margin-top: 108px !important;
  }
  .add-button::after {
    content: "";
    position: absolute;
    width: 248px;
    height: 1px;
    border-bottom: 1px solid rgb(180, 180, 180);
    margin-left: 32px;
    margin-top: 12px;
    border-image: var(--gradient);
    border-image-width: 100%;
    opacity: 0.8;
  }
  .thumbnail:hover .add-button {
    visibility: visible;
  }*/

  /*:global(.add-button svg) {
    fill: url(#shape-gradient) var(--green) !important;
  }*/
</style>
