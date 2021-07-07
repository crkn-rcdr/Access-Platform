<script lang="ts">
  import TiThMenu from "svelte-icons/ti/TiThMenu.svelte";
  import TiThLarge from "svelte-icons/ti/TiThLarge.svelte";
  import { createEventDispatcher, onMount, afterUpdate } from "svelte";
  import type {
    Manifest,
    Canvas,
  } from "@crkn-rcdr/access-data/src/access/Manifest";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import CanvasSelectableCard from "../canvases/CanvasSelectableCard.svelte";
  import CanvasViewer from "../canvases/CanvasViewer.svelte";

  export let manifest: Manifest;
  export let fullPage = true;
  export let multiple = true;
  export let selectedCanvases: Canvas[] = [];

  let listView = true;
  let previewCanvas: Canvas | null;
  let selectAll = false;
  let maxSelected = false;
  let manifestId = "";

  const dispatch = createEventDispatcher();

  function clearSelectedCanvasList() {
    selectedCanvases = [];
  }
  function addAllToCanvasList() {
    if (manifest["canvases"]) selectedCanvases = manifest["canvases"];
  }

  $: {
    if (selectAll) addAllToCanvasList();
    else clearSelectedCanvasList();
  }

  function handleSelection(canvas: Canvas) {
    console.log(canvas);
    if (selectedCanvases.includes(canvas)) {
      selectedCanvases = selectedCanvases.filter((el) => el !== canvas);
    } else if (!maxSelected) {
      selectedCanvases.push(canvas);
      selectedCanvases = selectedCanvases;
    } else if (maxSelected) {
      selectedCanvases = [canvas];
    }

    if (!multiple && selectedCanvases.length) {
      maxSelected = true;
    } else {
      maxSelected = false;
    }
    console.log(selectedCanvases);

    dispatch("selected", { selectedCanvases });
  }

  function handlePreview(event: any) {
    previewCanvas = event.detail.canvas;
  }

  function clearSelection() {
    selectedCanvases = [];
  }

  /** When the manifest changes, clear the selection */
  onMount(async () => {
    if (manifest) manifestId = manifest["id"];
  });

  afterUpdate(async () => {
    if (manifest) {
      let newManifestId = manifest["id"];
      if (manifestId !== newManifestId) clearSelection();
    }
  });
</script>

{#if manifest}
  {#if manifest["canvases"] && manifest["canvases"].length}
    <div class="results" class:full-page={fullPage}>
      <div class="manifest-title">
        <slot name="title" />
      </div>

      <div class="manifest-controls auto-align auto-align__a-center">
        <span class="toggle-switch">
          <!--Todo, component-->
          <button
            class="secondary toggle-button"
            class:active={listView}
            on:click={() => (listView = true)}
          >
            <div class="toggle-button-icon">
              <TiThMenu />
            </div>
          </button>
          <button
            class="secondary toggle-button"
            class:active={!listView}
            on:click={() => (listView = false)}
          >
            <div class="toggle-button-icon">
              <TiThLarge />
            </div>
          </button>
        </span>
        <!--button class="secondary">select all</button>
        <button class="secondary">deselect all</button-->
        <label class="auto-align auto-align__a-center">
          <input type="checkbox" bind:checked={selectAll} />
          {manifest?.["canvases"]?.length === selectedCanvases.length
            ? "deselect all"
            : "select all"}
        </label>

        {#if selectedCanvases.length}
          <div class="selected-canvas-list">
            {selectedCanvases.length} canvas{selectedCanvases.length > 1
              ? "es"
              : ""} selected.
          </div>
        {/if}
      </div>

      {#if listView}
        <div class="canvas-list">
          {#each manifest["canvases"] as canvas, i}
            <div class="canvas-list-item">
              <div class="canvas-list-item-title auto-align">
                <input
                  type="checkbox"
                  on:click={() => handleSelection(canvas)}
                  checked={selectedCanvases.includes(canvas)}
                />
                <h6>
                  {i + 1}/{manifest["canvases"].length} - {canvas["label"][
                    "none"
                  ]}
                </h6>
              </div>
              <img
                alt={canvas["label"]["value"]}
                class="thumbnail-img"
                src={`https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
                  canvas["id"]
                )}/full/!425,524/0/default.jpg`}
              />
            </div>
          {/each}
          <!--CanvasViewer
          canvasIds={manifest["canvases"].map((canvas) => `${canvas["id"]}`)}
          options={{
            zoomPerClick: 1,
            zoomPerScroll: 1,
            showNavigator: true,
            sequenceMode: true,
            showReferenceStrip: true,
            referenceStripScroll: true,
            showSequenceControl: false,
          }}
        /-->
        </div>
      {:else}
        <div class="canvas-tiles auto-grid">
          {#each manifest["canvases"] as canvas}
            <CanvasSelectableCard
              {canvas}
              selected={selectedCanvases.includes(canvas)}
              on:tileClicked={(e) => handleSelection(e.detail.canvas)}
              on:tilePreviewClicked={handlePreview}
            />
          {/each}
        </div>

        {#if previewCanvas}
          <div class="preview-wrap">
            <div class="canvas-title">
              <div class="auto-align auto-align__a-center">
                <div
                  class="back-button"
                  on:click={() => {
                    previewCanvas = null;
                  }}
                >
                  <TiArrowBack />
                </div>
                <h6>
                  Viewing {manifest["slug"]}: {manifest["label"]["none"]} / {previewCanvas[
                    "label"
                  ]["none"]}
                </h6>
              </div>
            </div>
            <div class="preview-canvas-wrap">
              <CanvasViewer canvas={previewCanvas} />
            </div>
          </div>
        {/if}
      {/if}
    </div>
  {:else}
    No canvases.
  {/if}
{/if}

<style>
  .results {
    width: 100%;
    height: 100%;
  }
  .results.full-page,
  .preview-wrap {
    background-color: var(--backdrop-bg);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem 3rem;
  }

  .manifest-controls {
    width: 100%;
    height: fit-content;
    padding: 1rem 0;
  }

  .manifest-controls > * {
    margin-right: 1rem;
  }

  /*.toggle-switch {
    flex: 9;
  }*/

  .toggle-button {
    margin-right: 0;
    padding: var(--perfect-fourth-8);
    cursor: pointer;
  }

  .toggle-button:nth-child(1) {
    border-radius: var(--border-radius) 0 0 var(--border-radius);
  }

  .toggle-button:nth-child(2) {
    margin-left: -0.2rem;
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
  }

  .toggle-button.active {
    filter: brightness(0.8);
  }

  .toggle-button-icon {
    width: var(--perfect-fourth-6);
    height: var(--perfect-fourth-6);
  }

  label {
    width: fit-content;
    height: fit-content;
  }

  .selected-canvas-list {
    flex: 9;
    text-align: right;
  }

  .canvas-list {
    width: 100%;
    height: 82%;
    overflow-y: auto;
  }

  .canvas-list-item {
    position: relative;
  }

  .canvas-list-item-title {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    height: fit-content;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.9);
    color: var(--light-font);
  }

  .canvas-list input[type="checkbox"] {
    width: 2rem;
    height: 2rem;
    margin-right: 1rem;
  }

  .canvas-list img {
    width: 100%;
  }

  h6 {
    margin: 0 !important;
    flex: 9;
  }

  .preview-canvas-wrap,
  .canvas-tiles {
    height: 90%;
    margin-top: 1em;
  }

  .canvas-title {
    height: var(--perfect-fourth-3);
  }

  .canvas-tiles {
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
