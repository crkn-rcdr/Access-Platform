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
  import { moveArrayElement } from "$lib/utils/arrayUtil";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import VirtualList from "$lib/components/shared/VirtualList.svelte";

  /**
   * @type {ObjectList} An ObjectList containing canvases to be listed.
   */
  export let canvases: ObjectList = [];

  /**
   * @type {boolean} If the add button should be displayed over the list of canvases.
   */
  export let showAddButton = true;

  /**
   * @type {number} The index of the selected, 'active' canvas in the canvases list.
   */
  let activeCanvasIndex = 0;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

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

    // Highlight and move to new position
    activeCanvasIndex = destinationItemIndex;

    //jumpTo(activeCanvasIndex);
    setActiveIndex(activeCanvasIndex);
  }

  /**
   * The method triggers a @event addClicked which outputs tells parent components that the add button was clicked.
   * @returns void
   */
  function addClicked() {
    dispatch("addClicked");
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var activeCanvasIndex is instantiated, the canvases positions model is set using @function setIndexModel(), then @var isInitialized is set to true.
   */
  onMount(() => {
    if (canvases.length) activeCanvasIndex = 0;
  });
</script>

<div class="auto-align auto-align__full auto-align auto-align__column">
  {#if showAddButton}
    <button class="primary lg" on:click={addClicked}>Add Canvas</button>
  {/if}
  <VirtualList
    bind:dataList={canvases}
    bind:activeIndex={activeCanvasIndex}
    disabled={!showAddButton}
    let:item
  >
    <div
      class="thumbnail auto-align auto-align__full"
      class:active={activeCanvasIndex === item.pos - 1}
      on:click={() => {
        setActiveIndex(item.pos - 1);
      }}
    >
      <div class="actions-wrap">
        <div
          class="auto-align auto-align__full auto-align auto-align__column"
          class:visibility-hidden={!showAddButton}
        >
          <div class="action pos">
            {item.pos}
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
              value={item.pos}
              on:changed={(e) => {
                moveCanvas(e, item.pos - 1);
              }}
            />
          </div>
          <div
            class="action icon"
            on:click={(e) => deleteCanvasByIndex(e, item.pos - 1)}
          >
            <TiTrash />
          </div>
        </div>
      </div>
      <div class="image-wrap">
        <img
          alt={item.label?.none}
          class="thumbnail-img"
          src={`https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
            item.id
          )}/full/!425,524/0/default.jpg`}
        />
      </div>
    </div>
  </VirtualList>
</div>

<style>
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
    flex: 1.8;
    margin-left: 1.5rem;
  }

  .action.icon {
    opacity: 0.6;
    cursor: pointer;
  }

  .image-wrap {
    flex: 4;
    text-align: right;
    padding-right: 2rem;
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
    display: inline;
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
