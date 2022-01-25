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
  import { createEventDispatcher, onMount } from "svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import { session } from "$app/stores";
  import type { ObjectListPage, PagedManifest } from "@crkn-rcdr/access-data";
  import { page as pageStore } from "$app/stores";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import DynamicDragAndDropListItem from "$lib/components/shared/DynamicDragAndDropListItem.svelte";
  import { showConfirmation } from "$lib/utils/confirmation";
  import Loading from "$lib/components/shared/Loading.svelte";
  import Paginator from "$lib/components/shared/Paginator.svelte";

  /**
   * @type {PagedManifest} An ObjectList containing canvases to be listed.
   */
  export let manifest: PagedManifest;

  /**
   * First page of canvases in the object.
   */
  export let firstPage: ObjectListPage;

  /**
   * The number of children in the object.
   */
  export let childrenCount: number;

  /**
   * @type {boolean} If the add button should be displayed over the list of canvases.
   */
  export let showAddButton = true;

  /**
   * @type {
      label?: Record<string, string>;
      id?: string;
    } The list of canvases in the manifest actively in the viewport.
    */
  export let canvases: {
    label?: Record<string, string>;
    id?: string;
  }[] = [];

  /**
   * @type {{
    label?: Record<string, string>;
    id: string;
  }} The canvas being displayed in the canvas viewer.
   */
  export let activeCanvas: any;

  let positions: number[] = [];

  /**
   * @type {number} The index of the selected, 'active' canvas in the canvases list.
   */
  let activeCanvasIndex = 0;

  let loading: boolean = false;

  /**
   * @type {number} Shows the number of pages
   */
  let page: number = 1;
  let size: number = 100;

  let list: HTMLElement;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  function setPositions() {
    positions = [];
    for (let i = 0; i < canvases.length; i++)
      positions.push((page - 1) * size + i + 1);
  }

  /**
   * Sets the @var activeCanvasIndex, the current 'selected' canvas. It also calls @event thumbnailClicked which outputs the index of the active canvas in the canvases list
   * @param index
   * @returns void
   */
  function setActiveIndex(index: number) {
    if (index >= childrenCount) index = childrenCount - 1;
    if (index < 0) index = 0;
    activeCanvasIndex = index;
    activeCanvas = canvases[activeCanvasIndex];
  }

  /**
   * Deletes a canvas from the canvases list at the index passed in.
   * @param event
   * @param index
   * @returns void
   */
  async function deleteCanvasByIndex(event: any, index: number) {
    event.stopPropagation();
    if (index >= 0 && index < canvases.length) {
      const data = {
        id: manifest.id,
        canvases: [canvases[index].id],
        user: $session.user,
      };

      // Shows a notification on move failure
      await showConfirmation(
        async () => {
          try {
            const response = await $session.lapin.mutation(
              "manifest.removeCanvases",
              data
            );
            return {
              success: true,
              details: "",
            };
          } catch (e) {
            return {
              success: false,
              details: e.message,
            };
          }
        },
        "Success: canvas removed from manifest.",
        "Error: failed to delete canvas."
      );

      // Shows a notification on page grab failure
      await showConfirmation(
        async () => {
          try {
            // we can just grab the current page again instead, but we need to store the previous page's last item to do so.
            await sendCurrentPageRequest();
            return {
              success: true,
              details: "",
            };
          } catch (e) {
            return {
              success: false,
              details: e.message,
            };
          }
        },
        "",
        "Error: failed to update page. Please refresh.",
        true
      );
    }
  }

  async function sendMoveRequest(canvasToMove, pagedDestinationIndex) {
    const data = {
      id: manifest.id,
      canvases: [canvasToMove.id],
      toIndex: pagedDestinationIndex,
      user: $session.user,
    };

    // Shows a notification on move failure
    await showConfirmation(
      async () => {
        try {
          const response = await $session.lapin.mutation(
            "manifest.moveCanvases",
            data
          );
          return {
            success: true,
            details: "",
          };
        } catch (e) {
          return {
            success: false,
            details: e?.message,
          };
        }
      },
      "Success: the new canvas position has saved.",
      "Error: failed to move canvas."
    );

    // Shows a notification on page grab failure
    await showConfirmation(
      async () => {
        try {
          // we can just grab the current page again instead, but we need to store the previous page's last item to do so.
          await sendCurrentPageRequest();
          return {
            success: true,
            details: "",
          };
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "",
      "Error: failed to update page. Please refresh.",
      true
    );
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
  async function moveCanvasOnInputChange(event: any, currentItemIndex) {
    if (loading) return;
    loading = true;

    let pagedDestinationIndex = parseInt(event.detail.value) - 1;

    if (pagedDestinationIndex >= 0 && pagedDestinationIndex < childrenCount) {
      const canvasToMove = canvases[currentItemIndex];

      await sendMoveRequest(canvasToMove, pagedDestinationIndex);

      // Highlight and move to new position
      if (pagedDestinationIndex < canvases.length) {
        activeCanvasIndex = pagedDestinationIndex;
        //jumpTo(activeCanvasIndex);
        setActiveIndex(activeCanvasIndex);
      }
    }

    loading = false;
  }

  /**
   * The method triggers a @event addClicked which outputs tells parent components that the add button was clicked.
   * @returns void
   */
  function addClicked() {
    dispatch("addClicked");
  }

  async function handlePage(event) {
    await showConfirmation(
      async () => {
        try {
          if (loading) return;

          loading = true;

          page = event.detail.page;

          const currUrl = `${window.location}`;
          const newUrl = currUrl.includes("page")
            ? currUrl.replace(/\?page\=.*/, `?page=${page}`)
            : `${currUrl}?page=${page}`;
          history.pushState({}, null, newUrl);

          const currPage = await $session.lapin.query("manifest.page", {
            id: manifest.id,
            page: page,
            limit: size,
          });
          if (currPage) canvases = currPage.list;
          else canvases = [];

          loading = false;
          return {
            success: true,
            details: "",
          };
        } catch (e) {
          return {
            success: false,
            details: e?.message,
          };
        }
      },
      "",
      "Error: failed to get page.",
      true
    );
  }

  async function handleItemDropped(event: {
    detail: { currentItemIndex: number; destinationItemIndex: number };
  }) {
    if (loading) return;
    loading = true;
    if (
      event.detail.currentItemIndex >= 0 &&
      event.detail.currentItemIndex < canvases.length
    ) {
      const pagedDestinationIndex =
        (page - 1) * size + event.detail.destinationItemIndex;

      const canvasToMove = canvases[event.detail.currentItemIndex];

      await sendMoveRequest(canvasToMove, pagedDestinationIndex);

      // Highlight and move to new position
      activeCanvasIndex = event.detail.destinationItemIndex;

      //jumpTo(activeCanvasIndex);
      setActiveIndex(activeCanvasIndex);
    }
    loading = false;
  }

  async function sendCurrentPageRequest() {
    await showConfirmation(
      async () => {
        try {
          const currPage = await $session.lapin.query("manifest.page", {
            id: manifest.id,
            page: page,
            limit: size,
          });
          if (currPage) canvases = currPage.list;
          else canvases = [];

          return {
            success: true,
            details: "",
          };
        } catch (e) {
          return {
            success: false,
            details: e?.message,
          };
        }
      },
      "",
      "Error: failed to update page. Please refresh.",
      true
    );
  }

  export async function grabCurrentPage() {
    await sendCurrentPageRequest();
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var activeCanvasIndex is instantiated, the canvases positions model is set
   */
  onMount(async () => {
    activeCanvasIndex = 0;
    if ($pageStore.query.get("page")) {
      page = parseInt($pageStore.query.get("page"));
      handlePage({ detail: { page } });
    } else {
      if (firstPage) {
        canvases = firstPage.list;
        activeCanvas = canvases[activeCanvasIndex];
      } else canvases = [];
    }
  });

  $: {
    canvases;
    setPositions();
  }
</script>

<div class="auto-align auto-align__full auto-align auto-align__column">
  {#if showAddButton}
    <button class="primary lg" on:click={addClicked}>Add Canvases</button>
  {/if}

  <div class="canvas-wrap" class:disabled={loading}>
    <!-- loop through the array where items are added when scrolling -->
    <DynamicDragAndDropList
      bind:container={list}
      on:itemDropped={handleItemDropped}
    >
      {#each canvases as canvas, i}
        <DynamicDragAndDropListItem pos={i + 1}>
          <div
            class="thumbnail auto-align auto-align__full"
            class:active={activeCanvasIndex === i}
            on:click={() => {
              setActiveIndex(i);
            }}
          >
            <div class="actions-wrap" class:not-loading={!loading}>
              <div
                class="auto-align auto-align__full auto-align auto-align__column"
                class:visibility-hidden={!showAddButton}
              >
                <div class="action pos">
                  {positions[i]}
                </div>
                <div
                  on:click={(e) => {
                    e.preventDefault();
                  }}
                  class="action pos-input"
                >
                  <AutomaticResizeNumberInput
                    name="position"
                    max={childrenCount}
                    value={positions[i]}
                    on:changed={(e) => {
                      moveCanvasOnInputChange(e, i);
                    }}
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
                loading="lazy"
                alt={canvas?.label?.none}
                class="thumbnail-img"
                src={`https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
                  canvas?.id
                )}/full/!425,524/0/default.jpg`}
              />
            </div>
          </div>
        </DynamicDragAndDropListItem>
      {/each}
    </DynamicDragAndDropList>
  </div>
  <div
    class="pagination-info auto-align auto-align__a-center auto-align auto-align__j-center
    auto-align__wrap"
  >
    {#if loading}
      <span class="page-info-loader">
        <Loading size="sm" backgroundType="gradient" />
      </span>
    {/if}
    <!--span >
      Showing {page * size + 1} to {page * size + canvases.length} of {childrenCount}
    </span-->
    <span class="page-info">
      <Paginator
        size="sm"
        {page}
        bind:pageSize={size}
        count={childrenCount}
        on:change={handlePage}
      />
    </span>
  </div>
</div>

<style>
  button.primary {
    width: 100%;
  }
  .thumbnail {
    height: max(22vh, 15rem);
    width: 100%;
    background-color: var(--light-bg-2);
    overflow: hidden;
  }
  .thumbnail:nth-child(1) {
    margin-top: 0px;
  }
  .thumbnail.active {
    filter: brightness(1.1);
  }
  /*.thumbnail.new {
    animation-name: new;
    animation-duration: 4s;
  }*/
  @keyframes new {
    from {
      background-color: var(--gold-light);
    }
    to {
      background-color: var(--light-bg-2);
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
    background: var(--color-gradient);
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
  .thumbnail:hover .actions-wrap.not-loading .action.icon {
    display: inherit;
  }
  .thumbnail:hover .actions-wrap.not-loading .pos {
    display: none;
  }

  .thumbnail:hover .actions-wrap.not-loading .pos-input {
    display: inherit;
  }
  .page-info-loader {
    margin-right: var(--margin-sm);
    flex: 10;
    text-align: center;
  }
  .canvas-wrap {
    display: flex;
    flex-direction: column;
    border-radius: 2px;
    width: 100%;
    max-height: 95%;
    background-color: white;
    overflow-x: hidden;
    padding: 0;
  }
  .canvas-wrap.disabled {
    opacity: 0.5;
    overflow: hidden;
    pointer-events: none;
    user-select: none;
  }
  .pagination-info {
    width: 100%;
  }
  :global(.canvas-wrap.disabled > *) {
    overflow: hidden;
    pointer-events: none;
    user-select: none;
  }
</style>
