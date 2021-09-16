<!--
@component
### Overview
Displays a ribbon of canvases. The canvases can be re-ordered, and canvases can be deleted from the list, and an event can be fired for adding canvases (this happens externally).

### Properties
|    |    |    |
| -- | -- | -- |
| canvases: ObjectList    | optional | An ObjectList containing canvases to be listed |
| showAddButton: boolean  | optional | If the add button should be displayed over the list of canvases |

### Usage
```  
<CanvasThumbnailList
  showAddButton={state != "add"}
  bind:canvases={manifest["canvases"]}
  on:thumbnailClicked={(e) => {
    setActiveCanvas(e.detail.index);
  }}
  on:addClicked={() => {
    changeView("add");
  }}
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*

-->
<script lang="ts">
  import type { ObjectList } from "@crkn-rcdr/access-data";
  import { createEventDispatcher, onMount } from "svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import { moveArrayElement } from "$lib/utils/arrayUtil";
  import VirtualList from "../shared/VirtualList.svelte";

  /**
   * @type {ObjectList} An ObjectList containing canvases to be listed.
   */
  export let canvases: ObjectList = [];

  /**
   * @type {boolean} If the add button should be displayed over the list of canvases.
   */
  export let showAddButton = true;

  /**
   * @type {boolean} Used to keep track of if the openseadragon viewer has been instantiated or not yet.
   */
  let isInitialized = false;

  /**
   * @type {number[]} A utility array that keeps track of the position numbers for the canvases listed in the thumbnail list, allows the user to move the canvases around by various means.
   */
  /**
   * Map<
    string,
    { pos: number; id: string; label: Record<string, string> }
  >
   */
  let indexModel: any = {};

  /**
   * @type {number} The index of the selected, 'active' canvas in the canvases list.
   */
  let activeCanvasIndex = 0;

  /**
   * @type {HTMLDivElement} The html element containing the thumbnail list.
   */
  let container: HTMLDivElement;

  /**
   * @type {number} The length of the canvases list before a canvas is added or removed. Helps highlight changes in the list.
   */
  let previousCanvasArrayLength = 0;

  /**
   * @type {number} The key code for the left arrow on the keyboard.
   */
  const LEFT_ARROW_CODE = 37;

  /**
   * @type {number} The key code for the up arrow on the keyboard.
   */
  const UP_ARROW_CODE = 38;

  /**
   * @type {number} The key code for the right arrow on the keyboard.
   */
  const RIGHT_ARROW_CODE = 39;

  /**
   * @type {number} The key code for the down arrow on the keyboard.
   */
  const DOWN_ARROW_CODE = 40;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();
  2;
  /**
   * @type {number} The length of the index model used to control the drag and drop menu
   */
  let indexModelLength = 0;

  /**
   * Sets the @var previousCanvasArrayLength
   * @returns void
   */
  function trackNewCanvases() {
    previousCanvasArrayLength = indexModelLength;
  }

  /**
   * Sets the @var indexModel to an array of numbers indicating the position of the canvases in the canvases list.
   * @returns void
   */
  function setIndexModel() {
    indexModel = {};
    for (let i = 0; i < canvases.length; i++) {
      indexModel[canvases[i].id] = {
        pos: i + 1,
        id: canvases[i].id,
        label: canvases[i].label,
      };
    }
  }

  /**
   * Sets the @var activeCanvasIndex, the current 'selected' canvas. It also calls @event thumbnailClicked which outputs the index of the active canvas in the canvases list
   * @param index
   * @returns void
   */
  function setActiveIndex(index: number) {
    if (index >= canvases.length) index = canvases.length - 1;
    if (index < 0) index = 0;
    activeCanvasIndex = index;
    dispatch("thumbnailClicked", { index });
  }

  /**
   * Jumps to the element for the canvas at index in the canvases list drawn in the container
   * @param index
   * @returns void
   */
  function jumpTo(index: number) {
    let canvasThumbnails = container.querySelectorAll(".thumbnail");
    canvasThumbnails?.[index]?.scrollIntoView();
  }

  /**
   * Deletes a canvas from the canvases list at the index passed in.
   * @param event
   * @param index
   * @returns void
   */
  function deleteCanvasByIndex(event: any, index: number) {
    event.stopPropagation();
    if (index >= 0 && index < canvases.length) {
      canvases.splice(index, 1);
      canvases = canvases;
      setActiveIndex(activeCanvasIndex);
    }
  }

  /**
   * Moves a canvas from the originalItemIndex to the index specified in the event object
   * It then calls @function setIndexModel to update the index model,
   * Jumps to the new position of the canvas in the list by calling @function jumpTo,
   * And sets the active canvas index to the new position of the canvas, using @function setActiveIndex
   * @param event
   * @param originalItemIndex
   * @returns void
   */
  function moveCanvas(event: any, originalItemIndex: number) {
    // Move the canvas and trigger saving
    let destinationItemIndex = parseInt(event.detail.value) - 1;
    moveArrayElement(canvases, originalItemIndex, destinationItemIndex);
    canvases = canvases;

    // Update the position inputs
    setIndexModel();

    // Highlight and move to new position
    activeCanvasIndex = destinationItemIndex;
    //jumpTo(activeCanvasIndex);
    setActiveIndex(activeCanvasIndex);
  }

  /**
   * Sets the active canvas to the canvas before the current active canvas. It then
   * jumps to the new active canvas by calling @function jumpTo,
   * And sets the active canvas index to the new position of the canvas, using @function setActiveIndex
   * @returns void
   */
  function selectPrevious() {
    if (activeCanvasIndex > 0) {
      activeCanvasIndex--;
      jumpTo(activeCanvasIndex);
      setActiveIndex(activeCanvasIndex);
    }
  }

  /**
   * Sets the active canvas to the canvas after the current active canvas. It then
   * jumps to the new active canvas by calling @function jumpTo,
   * And sets the active canvas index to the new position of the canvas, using @function setActiveIndex
   * @returns void
   */
  function selectNext() {
    if (activeCanvasIndex < canvases.length - 1) {
      activeCanvasIndex++;
      jumpTo(activeCanvasIndex);
      setActiveIndex(activeCanvasIndex);
    }
  }

  /**
   * Sets the active canvas based on arrow key presses. Calls @function selectPrevious for left and up arrows, and @function selectNext for down and right arrows.
   * @param event
   * @returns void
   */
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

  /**
   * The method triggers a @event addClicked which outputs tells parent components that the add button was clicked.
   * @returns void
   */
  function addClicked() {
    dispatch("addClicked");
  }

  /**
   * If the list has been drawn previously (@var isInitialized), then call @function trackNewCanvases to help highlight changes, and update the psoitions displayed in the list by calling @function setIndexModel
   * @returns void
   */
  function updated() {
    if (isInitialized) {
      trackNewCanvases();
      setIndexModel();
    }
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var activeCanvasIndex is instantiated, the canvases positions model is set using @function setIndexModel(), then @var isInitialized is set to true.
   */
  onMount(() => {
    if (canvases.length) activeCanvasIndex = 0;
    setIndexModel();
    isInitialized = true;
  });

  /**
   * @listens canvases
   * @description Watches for changes in the canvases list, then calls @function updated to re set the @var indexModel, the canvases positions model, and stores the previous size of the canvases list, to help highlight the new items.
   */
  $: {
    canvases;
    updated();
  }

  /**
   * @listens indexModel
   * @description Sets @var indexModelLength, the canvases positions model, and stores the h any time the indexModel changes.
   */
  $: {
    indexModelLength = Object.keys(indexModel).length;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

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
    {#if indexModelLength === canvases.length}
      <VirtualList
        bind:items={canvases}
        on:itemDropped={(e) => {
          setActiveIndex(e.detail.destinationItemIndex);
        }}
        let:item
      >
        <div
          class="thumbnail"
          class:active={indexModel[item["id"]]["pos"] - 1 === activeCanvasIndex}
          class:new={previousCanvasArrayLength != 0 &&
            indexModel[item["id"]]["pos"] - 1 <
              canvases.length - previousCanvasArrayLength}
          on:mousedown={() => setActiveIndex(indexModel[item["id"]]["pos"] - 1)}
        >
          <div class="auto-align auto-align__full">
            <div class="actions-wrap">
              <div
                class="auto-align auto-align__full auto-align auto-align__column"
                class:visibility-hidden={!showAddButton}
              >
                <div class="action pos">
                  {indexModel[item["id"]]["pos"]}
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
                      moveCanvas(e, indexModel[item["id"]]["pos"] - 1);
                    }}
                    bind:value={indexModel[item["id"]]["pos"]}
                  />
                </div>
                <div
                  class="action icon"
                  on:click={(e) =>
                    deleteCanvasByIndex(e, indexModel[item["id"]]["pos"] - 1)}
                >
                  <TiTrash />
                </div>
              </div>
            </div>
            <div class="image-wrap">
              <img
                alt={item?.["label"]?.["value"]}
                class="thumbnail-img"
                src={`https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
                  item["id"]
                )}/full/!425,524/0/default.jpg`}
              />
            </div>
          </div>
        </div>
      </VirtualList>
    {/if}
  </div>
</div>

<style>
  .list {
    position: relative;
    flex: 9;
    width: 100%;
    overflow-y: auto;
    outline: none !important;
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

  .vs-wrap {
    height: 72vh;
  }
</style>
