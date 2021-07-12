<script lang="ts">
  import {
    afterUpdate,
    beforeUpdate,
    createEventDispatcher,
    onMount,
  } from "svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "$lib/arrayUtil";

  export let canvases: Canvas[] = [];
  export let showAddButton = true;

  let indexModel: number[] = [];
  let activeCanvasIndex: number = 0;
  let container: HTMLDivElement;
  let previousCanvasArrayLength = 0;

  const LEFT_ARROW_CODE: number = 37;
  const UP_ARROW_CODE: number = 38;
  const RIGHT_ARROW_CODE: number = 39;
  const DOWN_ARROW_CODE: number = 40;

  const dispatch = createEventDispatcher();

  function setIndexModel(trackNewCanvases: boolean) {
    if (trackNewCanvases) previousCanvasArrayLength = indexModel.length;
    console.log("prevLen", previousCanvasArrayLength);
    indexModel = [];
    for (let i = 0; i < canvases.length; i++) {
      indexModel.push(i + 1);
    }
    console.log("currlen", indexModel.length);
  }

  function setActiveIndex(index: number) {
    if (index >= canvases.length) index = canvases.length - 1;
    if (index < 0) index = 0;
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
    setIndexModel(false);

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

  function addClicked() {
    dispatch("addClicked");
  }

  onMount(() => {
    if (canvases.length) activeCanvasIndex = 0;
    setIndexModel(false);
  });

  afterUpdate(() => {
    if (indexModel.length !== 0) setIndexModel(true);
  });
</script>

<svelte:window on:keydown={handleKeydown} />

{#if indexModel.length}
  <div class="auto-align auto-align__full auto-align auto-align__column">
    {#if showAddButton}
      <button class="primary lg" on:click={addClicked}>Add Canvas</button>
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
            class:active={i === activeCanvasIndex}
            class:new={previousCanvasArrayLength != 0 &&
              i < canvases.length - previousCanvasArrayLength}
            on:mousedown={() => setActiveIndex(i)}
          >
            <div class="auto-align auto-align__full">
              <div class="actions-wrap">
                <div
                  class="auto-align auto-align__full auto-align auto-align__column"
                  class:visibility-hidden={!showAddButton}
                >
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
                </div>
              </div>
              <div class="image-wrap">
                <img
                  alt={canvas["label"]["value"]}
                  class="thumbnail-img"
                  src={`https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
                    canvas["id"]
                  )}/full/!425,524/0/default.jpg`}
                />
              </div>
            </div>
          </div>
        {/each}
      </DynamicDragAndDropList>
    </div>
  </div>
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
    opacity: 0.5;
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

  .thumbnail.new {
    animation-name: new;
    animation-duration: 4s;
  }

  @keyframes new {
    from {
      background-color: var(--gold-light);
    }
    to {
      background-color: var(--structural-div-bg);
    }
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
