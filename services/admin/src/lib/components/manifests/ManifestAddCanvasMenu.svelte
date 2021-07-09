<script lang="ts">
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import TiArrowRight from "svelte-icons/ti/TiArrowRight.svelte";
  import FaPlus from "svelte-icons/fa/FaPlus.svelte";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import { createEventDispatcher } from "svelte";
  import type {
    Manifest,
    Canvas,
  } from "@crkn-rcdr/access-data/src/access/Manifest";
  import ManifestCanvasSelector from "./ManifestCanvasSelector.svelte";

  export let destinationManifest: Manifest;
  export let destinationIndex: number = 0;
  export let multiple = true;

  const dispatch = createEventDispatcher();

  let selectedManifest: Manifest;
  let selectedCanvases: Canvas[] = [];
  let showManifest = false;
  let selectAll = false;
  let error = "";

  async function handleSelect(event: any) {
    let noid = event.detail;
    const response = await fetch(`/object/${noid}.json`);
    const json = await response.json();
    if (response.ok) {
      const object = json.object as AccessObject;
      if (isCollection(object)) {
        error = "Error: Object is a collection, please select another.";
      } else if (isManifest(object)) {
        selectedManifest = object;
      }
    } else {
      error = json.error;
    }
    showManifest = true;
  }

  function handleCancelPressed() {
    selectedCanvases = [];
    dispatch("done");
  }

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
        <div class="auto-align auto-align__a-center">
          <h6>Search for a manifest to add canvases from</h6>
          <button class="danger cancel-button" on:click={handleCancelPressed}>
            Exit
          </button>
        </div>
      </div>
      <br />

      {#if error}
        <div class="alert alert-danger">
          {error}
        </div>
      {/if}

      <div>
        <!--Todo: ask how best to limit to only manifests-->
        <TypeAhead
          label=""
          placeholder="Search for a manifest..."
          on:selected={handleSelect}
          on:keypress={() => (error = "")}
        >
          View and select canvases
          <div class="icon"><TiArrowRight /></div>
        </TypeAhead>
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
            {selectedCanvases.length}/{selectedCanvases.length}
          </div>
        {/if}
      </div>
    {/if}

    <ManifestCanvasSelector
      bind:manifest={selectedManifest}
      bind:selectedCanvases
      bind:multiple
      bind:selectAll
    >
      <!--div class="auto-align auto-align__a-center" slot="title">
        <div class="title-wrap">
          <div class="auto-align auto-align__a-center">
            <div
              class="back-button"
              on:click={() => {
                error = "";
                showManifest = false;
              }}
            >
              <TiArrowBack />
            </div>
            <div class="title-text">
              {selectedManifest["slug"]}: {selectedManifest["label"]["none"]}
            </div>
          </div>
        </div>
        <div class="action-buttons">
          <button
            class="primary"
            class:opacity-hidden={selectedCanvases.length ? false : true}
            on:click={handleAddPressed}
          >
            Add Canvas{selectedCanvases.length > 1 ? "es" : ""}
          </button>
        </div>
      </div-->
    </ManifestCanvasSelector>
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

  .title-text {
    flex: 9;
    margin: 0 !important;
  }

  .title-wrap {
    flex: 9;
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

  h6 {
    flex: 9;
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

  :global(.add-menu .referencestrip) {
    left: 60px !important;
  }

  :global(.openseadragon-canvas) {
    padding-left: 60px;
    background: #222;
  }
</style>
