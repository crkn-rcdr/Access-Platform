<!--
@component
### Overview
Displays a list that when scrolls veritcally, creates and distoys children elements in the dom depending on if they are visible in the list component or not. Allows for optional reordering through drag and drop.

### Properties
|    |    |    |
| -- | -- | -- |
| dataList: any[]    | required | An array representing the items that will be listed. |
| activeIndex: number  | optional | The index of the selected, 'active' item in the dataList list  |
| disabled: boolean  | optional | If the list is currently disabled or not |
| draggable: boolean  | optional | If the items in the list should be draggable. |

### Usage
```  
  <VirtualList 
    bind:dataList={canvases}
    bind:activeIndex={activeCanvasIndex} 
    let:item>
      <div>{JSON.stringify{item}}</div>
  </VirtualList/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*

-->
<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import VirtualScroll from "svelte-virtual-scroll-list";
  import DynamicDragAndDropListItem from "../shared/DynamicDragAndDropListItem.svelte";

  /**
   * @type {boolean} If the list is currently disabled or not
   */
  export let disabled: boolean = false;

  /**
   * @type {boolean} If the items in the list should be draggable.
   */
  export let draggable: boolean = true;

  /**
   * @type {number} The index of the selected, 'active' item in the dataList list.
   */
  export let activeIndex = 0;

  /**
   * @type {any[]} An ObjectList containing dataList to be listed.
   */
  export let dataList: any[] = [];

  /**
   * @type {boolean} Used to keep track of if the openseadragon viewer has been instantiated or not yet.
   */
  let isInitialized = false;

  /**
   * @type {any} A utility array that keeps track of the position numbers for the dataList listed in the thumbnail list, allows the user to move the dataList around by various means.
   */
  let indexModel: any = {};

  /**
   * @type {HTMLDivElement} The html element containing the thumbnail list.
   */
  let container: HTMLDivElement;

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

  /**
   * @type {any} A variable that holds the virtual scroll component
   */
  let list;

  /**
   * @type {number} The length of the index model used to control the drag and drop menu
   */
  let indexModelLength = 0;

  /**
   * @type {any} A variable that allows the developer to interact with each individual item in @var dataList in the parent component.
   */
  let item = {};

  /**
   * Sets the @var indexModel to an array of numbers indicating the position of the dataList in the dataList list.
   * @returns void
   */
  function setIndexModel() {
    indexModel = {};
    for (let i = 0; i < dataList.length; i++) {
      indexModel[dataList[i].id] = {
        pos: i + 1,
        ...dataList[i],
      };
    }
  }

  /**
   * Sets the @var activeIndex, the current 'selected' canvas. It also calls @event itemClicked which outputs the index of the active canvas in the dataList list
   * @param index
   * @returns void
   */
  function setActiveIndex(index: number) {
    if (index >= dataList.length) index = dataList.length - 1;
    if (index < 0) index = 0;
    activeIndex = index;
    dataList = dataList;
    dispatch("itemClicked", { index });
  }

  /**
   * Jumps to the element for the canvas at index in the dataList list drawn in the container
   * @param index
   * @returns void
   */
  function jumpTo(index: number) {
    let canvasThumbnails = container.querySelectorAll(".thumbnail");
    canvasThumbnails?.[index]?.scrollIntoView();
  }

  /**
   * Sets the active canvas to the canvas before the current active canvas. It then
   * jumps to the new active canvas by calling @function jumpTo,
   * And sets the active canvas index to the new position of the canvas, using @function setActiveIndex
   * @returns void
   */
  function selectPrevious() {
    if (activeIndex > 0) {
      activeIndex--;
      jumpTo(activeIndex);
      setActiveIndex(activeIndex);
    }
  }

  /**
   * Sets the active canvas to the canvas after the current active canvas. It then
   * jumps to the new active canvas by calling @function jumpTo,
   * And sets the active canvas index to the new position of the canvas, using @function setActiveIndex
   * @returns void
   */
  function selectNext() {
    if (activeIndex < dataList.length - 1) {
      activeIndex++;
      jumpTo(activeIndex);
      setActiveIndex(activeIndex);
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
   * If the list has been drawn previously (@var isInitialized), then call @function trackNewdataList to help highlight changes, and update the psoitions displayed in the list by calling @function setIndexModel
   * @returns void
   */
  function updated() {
    if (isInitialized) {
      setIndexModel();
    }
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var activeIndex is instantiated, the dataList positions model is set using @function setIndexModel(), then @var isInitialized is set to true.
   */
  onMount(() => {
    if (dataList.length) activeIndex = 0;
    setIndexModel();
    isInitialized = true;
  });

  /**
   * @listens dataList
   * @description Watches for changes in the dataList list, then calls @function updated to re set the @var indexModel, the dataList positions model, and stores the previous size of the dataList list, to help highlight the new items.
   */
  $: {
    dataList;
    updated();
  }

  /**
   * @listens indexModel
   * @description Sets @var indexModelLength, the dataList positions model, and stores the h any time the indexModel changes.
   */
  $: {
    indexModelLength = Object.keys(indexModel).length;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div bind:this={container} tabindex="0" class="list" class:disabled>
  {#if indexModelLength === dataList.length}
    {#if draggable}
      <DynamicDragAndDropList
        bind:dragList={dataList}
        on:itemDropped={(e) => {
          setActiveIndex(e.detail.destinationItemIndex);
        }}
      >
        <div class="vs-wrap">
          <VirtualScroll
            bind:this={list}
            data={Object.values(indexModel)}
            key="id"
            let:data
          >
            <DynamicDragAndDropListItem bind:pos={indexModel[data["id"]].pos}>
              <slot item={indexModel[data["id"]]} />
            </DynamicDragAndDropListItem>
          </VirtualScroll>
        </div>
      </DynamicDragAndDropList>
    {:else}
      <VirtualScroll
        bind:this={list}
        data={Object.values(indexModel)}
        key="id"
        let:data
      >
        <slot item={indexModel[data["id"]]} />
      </VirtualScroll>
    {/if}
  {/if}
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

  .vs-wrap {
    height: 72vh;
  }
</style>
