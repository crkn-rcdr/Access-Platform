<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Manifest } from "@crkn-rcdr/access-data/src/access/Manifest";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import CanvasSelectorGridTile from "../canvases/CanvasSelectorGridTile.svelte";
  import CanvasViewer from "../canvases/CanvasViewer.svelte";

  export let manifest: Manifest;
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
        <h5>
          {manifest["slug"]}: {manifest["label"]["none"]}
        </h5>

        <div class="action-buttons">
          <button
            class="primary {selectedCanvases.length > 0
              ? ''
              : 'opacity-hidden'}"
            disabled={selectedCanvases.length ? false : true}
            on:click={handleAddPressed}
            >Add Canvas{selectedCanvases.length > 1 ? "es" : ""}</button
          >
        </div>
      </div>
    </div>

    <div class="canvas-tiles">
      {#each manifest["canvases"] as canvas}
        <CanvasSelectorGridTile
          {canvas}
          on:tileClicked={handleSelection}
          on:tilePreviewClicked={handlePreview}
        />
      {/each}
    </div>
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
        <h5>
          {manifest["slug"]}: {manifest["label"]["none"]} / {previewCanvas[
            "label"
          ]["none"]}
        </h5>
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
    background: black;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem 3rem;
  }

  .preview-canvas-wrap {
    height: 80%;
    padding: 0 var(--perfect-fourth-4);
    margin: auto;
  }

  h5 {
    margin-bottom: 0 !important;
    flex: 9;
  }

  .manifest-title,
  .canvas-title {
    color: var(--light-font);
    margin: var(--perfect-fourth-3) var(--perfect-fourth-4) !important;
    height: var(--perfect-fourth-2);
  }

  .canvas-tiles {
    height: 70vh;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .back-button {
    width: var(--perfect-fourth-4);
    height: var(--perfect-fourth-4);
    margin-right: 1rem;
    cursor: pointer;
    border-radius: 0.25rem;
  }

  .back-button:hover {
    background-color: #111111;
  }

  .opacity-hidden {
    opacity: 0;
    cursor: auto;
  }
</style>
