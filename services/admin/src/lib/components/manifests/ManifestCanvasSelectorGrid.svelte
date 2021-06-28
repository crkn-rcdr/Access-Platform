<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Manifest } from "@crkn-rcdr/access-data/src/access/Manifest";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import CanvasSelectorGridTile from "../canvases/CanvasSelectorGridTile.svelte";
  import CanvasViewer from "../canvases/CanvasViewer.svelte";

  export let manifest: Manifest;
  export let buttonActionText = "Select";

  let selectedCanvases: Canvas[] = [];
  let previewCanvas: Canvas | null;

  const dispatch = createEventDispatcher();

  function handleSelection(event: any) {
    let canvas = event.detail.canvas;
    if (selectedCanvases.includes(canvas)) {
      selectedCanvases = selectedCanvases.filter((el) => el !== canvas);
    } else {
      selectedCanvases.push(canvas);
      selectedCanvases = selectedCanvases;
    }
  }

  function handlePreview(event: any) {
    previewCanvas = event.detail.canvas;
  }

  function handleBackButtonPressed() {
    dispatch("backPressed");
  }

  function handleAddPressed() {
    dispatch("addPressed", { selectedCanvases });
  }

  function clearSelection() {
    selectedCanvases = [];
  }

  /** When the manifest changes, clear the selection */
  $: {
    manifest;
    clearSelection();
  }
</script>

{#if manifest}
  <div class="results">
    <div class="manifest-title">
      <div class="auto-align auto-align__a-center">
        <div class="back-button" on:click={handleBackButtonPressed}>
          <TiArrowBack />
        </div>
        <h6>
          Select canvases from {manifest["slug"]}: {manifest["label"]["none"]}
        </h6>

        <div class="action-buttons">
          <button
            class="primary {selectedCanvases.length > 0
              ? ''
              : 'opacity-hidden'}"
            disabled={selectedCanvases.length ? false : true}
            on:click={handleAddPressed}
            >{buttonActionText} Canvas{selectedCanvases.length > 1
              ? "es"
              : ""}</button
          >
        </div>
      </div>
    </div>

    {#if manifest["canvases"] && manifest["canvases"].length}
      <div class="canvas-tiles">
        {#each manifest["canvases"] as canvas}
          <CanvasSelectorGridTile
            {canvas}
            on:tileClicked={handleSelection}
            on:tilePreviewClicked={handlePreview}
          />
        {/each}
      </div>
    {:else}
      No canvases.
    {/if}
  </div>
{/if}

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

<style>
  .results,
  .preview-wrap {
    background-color: var(--backdrop-bg);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem 3rem;
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

  .manifest-title,
  .canvas-title {
    height: var(--perfect-fourth-2);
  }

  .canvas-tiles {
    overflow-x: hidden;
    overflow-y: auto;
  }

  .back-button {
    width: var(--perfect-fourth-4);
    height: var(--perfect-fourth-4);
    margin-right: 1rem;
    cursor: pointer;
    border-radius: var(--border-radius);
  }

  .back-button:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .opacity-hidden {
    opacity: 0;
    cursor: auto;
  }
</style>
