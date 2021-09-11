<!--
@component
### Overview
This component allows the user to search through other manifests and select canvases from a manifest to add to a manifest

### Properties
|    |    |    |
| -- | -- | -- |
| destinationManifest: Manifest  | required | The manifest to add selected canvases to. |
| destinationIndex: number       | optional | The starting index to add the selected canvases at. |
| multiple: boolean              | optional | If the user is allowed to select multiple canvases to add. |

### Usage
```  
<ManifestAddCanvasMenu
  bind:destinationManifest={manifest}
  on:done={() => {
    state = "view";
    setActiveCanvas(0);
  }}
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import FaPlus from "svelte-icons/fa/FaPlus.svelte";
  import { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import { createEventDispatcher } from "svelte";
  import type { Manifest } from "@crkn-rcdr/access-data/src/access/Manifest";
  import type { ObjectList } from "@crkn-rcdr/access-data";
  import CanvasesSelector from "$lib/components/canvases/CanvasesSelector.svelte";

  /**
   * @type {Manifest} The manifest to add selected canvases to.
   */
  export let destinationManifest: Manifest;

  /**
   * @type {number} The starting index to add the selected canvases at.
   */
  export let destinationIndex = 0;

  /**
   * @type {boolean} If the user is allowed to select multiple canvases to add.
   */
  export let multiple = true;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {Manifest} The manifest to select canvases from.
   */
  let selectedManifest: Manifest;

  /**
   * @type {ObjectList} The canvases the user selects.
   */
  let selectedCanvases: ObjectList = [];

  /**
   * @type {string} If a manifest is selected.
   */
  let isManifestSelected = false;

  /**
   * @type {string} If the select all button is activated.
   */
  let isAllSelected = false;

  /**
   * @type {string} An error message to be displayed.
   */
  let error = "";

  /**
   * When a manifest is selected from the table of search results, grab its details from the backend.
   * @param event
   * @returns void
   */
  async function handleSelect(event: any) {
    try {
      let prefixedNoid = event.detail;
      const response = await $session.lapin.query(
        "accessObject.get",
        prefixedNoid
      );
      if (response) {
        const object = AccessObject.parse(response);
        if (isCollection(object)) {
          error = "Error: Object is a collection, please select another.";
        } else if (isManifest(object)) {
          selectedManifest = object;
          isManifestSelected = true;
        }
      } else {
        error = response.toString();
      }
    } catch (e) {
      error = e;
    }
  }

  /**
   * When canceled is pressed, reset the selected canvases, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */
  function handleCancelPressed() {
    selectedCanvases = [];
    dispatch("done");
  }

  /**
   * When add is pressed, add the selected canvases to the begining of the destination manifest's canvases list, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */
  function handleAddPressed() {
    destinationManifest?.canvases?.splice(
      destinationIndex,
      0,
      ...selectedCanvases
    );
    destinationManifest = destinationManifest;
    selectedCanvases = [];
    dispatch("done");
  }
</script>

<div class="canvas-selector-wrap add-menu">
  {#if !isManifestSelected}
    <div class="manifest-selector">
      <div class="add-menu-title">
        <button
          class="secondary cancel-button auto-align auto-align__a-center"
          on:click={handleCancelPressed}
        >
          <div class="icon">
            <TiArrowBack />
          </div>
          Exit
        </button>
      </div>
      <br />
      {#if error}
        <br />
        <div class="alert alert-danger">
          {error}
        </div>
      {/if}

      <div>
        <!--Todo: ask how best to limit to only manifests-->
        <TypeAhead
          placeholder="Search for a manifest to add canvases from..."
          type="manifest"
          on:selected={handleSelect}
          on:keypress={() => (error = "")}
        />
      </div>
    </div>
  {:else}
    {#if multiple}
      <div class="manifest-controls auto-align auto-align__a-center">
        <div
          class="icon"
          on:click={() => {
            error = "";
            isManifestSelected = false;
          }}
          data-tooltip="Go back to manifest search"
          data-tooltip-flow="bottom"
        >
          <TiArrowBack />
        </div>

        {#if selectedCanvases.length}
          <div
            class="icon add-all-button"
            on:click={handleAddPressed}
            data-tooltip="Add selected canvases"
            data-tooltip-flow="bottom"
          >
            <FaPlus />
          </div>
        {/if}

        <div
          data-tooltip={`${isAllSelected ? "Deselect" : "Select"} all`}
          data-tooltip-flow="bottom"
        >
          <img
            class="icon select-all"
            src={`/static/icons/${
              isAllSelected ? "deselect.png" : "select.svg"
            }`}
            alt="select all"
            on:click={() => (isAllSelected = !isAllSelected)}
          />
        </div>

        {#if selectedCanvases.length}
          <div class="selected-canvas-list">
            {selectedCanvases.length}/{selectedManifest?.["canvases"]?.length}
          </div>
        {/if}
      </div>
    {/if}

    {#if selectedManifest}
      {#if selectedManifest["canvases"] && selectedManifest["canvases"].length}
        <div class="results full-page">
          <h6
            class="auto-align auto-align__a-center auto-align__j-center title"
          >
            {destinationManifest.slug}{destinationManifest.label?.none?.length
              ? `: ${destinationManifest.label.none}`
              : ""}
          </h6>
          <div class="canvas-list-item-viewer">
            <CanvasesSelector
              bind:selectedCanvases
              bind:multiple
              bind:selectAll={isAllSelected}
              canvases={selectedManifest["canvases"]}
              options={{
                showNavigator: true,
                sequenceMode: true,
                showReferenceStrip: true,
                showHomeControl: false,
                showZoomControl: false,
                showFullPageControl: false,
                showSequenceControl: false,
                referenceStripScroll: "vertical",
                autoHideControls: false,
              }}
            />
          </div>
        </div>
      {:else}
        No canvases.
      {/if}
    {/if}
  {/if}
</div>

<style>
  .canvas-selector-wrap {
    position: relative;
    height: 100%;
    background-color: var(--backdrop-bg);
  }

  .add-menu-title {
    width: 100%;
  }

  .manifest-selector {
    padding: 1.5rem 3rem;
  }

  .manifest-controls {
    width: 100%;
    height: fit-content;
    padding-top: 0.5rem;
    background: var(--darkest-bg);
    z-index: 1;
    color: var(--light-font);
    padding: 0.7rem;
    position: absolute;
    height: 100%;
    width: 60px;
    display: flex;
    flex-direction: column;
  }

  .manifest-controls > * {
    margin-bottom: 1rem;
  }

  .add-all-button,
  .icon,
  .select-all {
    cursor: pointer;
  }

  .add-all-button {
    background: var(--teal);
    border-radius: var(--border-radius);
    padding: 0.2rem;
  }

  .select-all {
    padding: 0.2rem;
  }

  .results {
    width: 100%;
    height: 100%;
  }

  .results.full-page {
    background-color: var(--backdrop-bg);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .canvas-list-item-viewer {
    height: 100%;
    width: 100%;
    position: relative;
    background: var(--darkest-bg);
  }

  .title {
    width: 100%;
    margin: 0 !important;
    padding: var(--perfect-fourth-8);
    color: var(--light-font);
    background-color: var(--dark-bg);
  }

  :global(.add-menu .referencestrip) {
    left: 60px !important;
  }

  :global(.openseadragon-canvas) {
    padding-left: 60px;
    background: var(--darkest-bg);
  }
</style>
