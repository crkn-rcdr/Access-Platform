<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
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
   * @type {string} Slug being resolved.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} Slug being resolved.
   */
  export let destinationManifest: Manifest;

  /**
   * @type {string} Slug being resolved.
   */
  export let destinationIndex: number = 0;

  /**
   * @type {string} Slug being resolved.
   */
  export let multiple = true;

  /**
   * @type {string} Slug being resolved.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {string} Slug being resolved.
   */
  let selectedManifest: Manifest;

  /**
   * @type {string} Slug being resolved.
   */
  let selectedCanvases: ObjectList = [];

  /**
   * @type {string} Slug being resolved.
   */
  let showManifest = false;

  /**
   * @type {string} Slug being resolved.
   */
  let selectAll = false;

  /**
   * @type {string} Slug being resolved.
   */
  let error = "";

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  async function handleSelect(event: any) {
    try {
      let prefixedNoid = event.detail;
      const response = await $session.lapin.query("noid.resolve", prefixedNoid);
      if (response) {
        const object = AccessObject.parse(response);
        if (isCollection(object)) {
          error = "Error: Object is a collection, please select another.";
        } else if (isManifest(object)) {
          selectedManifest = object;
          showManifest = true;
        }
      } else {
        error = response.toString();
      }
    } catch (e) {
      error = e;
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function handleCancelPressed() {
    selectedCanvases = [];
    dispatch("done");
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
  {#if !showManifest}
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
          label="Search for a manifest to add canvases from:"
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
            showManifest = false;
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
          data-tooltip={`${selectAll ? "Deselect" : "Select"} all`}
          data-tooltip-flow="bottom"
        >
          <img
            class="icon select-all"
            src={`/static/icons/${selectAll ? "deselect.png" : "select.svg"}`}
            alt="select all"
            on:click={() => (selectAll = !selectAll)}
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
          <div class="canvas-list-item-viewer">
            <CanvasesSelector
              bind:selectedCanvases
              bind:multiple
              bind:selectAll
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
                homeFillsViewer: true,
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
    background: #222;
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
  }

  :global(.add-menu .referencestrip) {
    left: 60px !important;
  }

  :global(.openseadragon-canvas) {
    padding-left: 60px;
    background: #222;
  }
</style>
