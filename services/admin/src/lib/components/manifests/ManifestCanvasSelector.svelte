<script lang="ts">
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

  let previewCanvas: Canvas | null;
  let maxSelected = false;
  let manifestId = "";

  const dispatch = createEventDispatcher();

  function handleSelection(event: any) {
    let canvas = event.detail.canvas;

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
    manifestId = manifest["id"];
  });

  afterUpdate(async () => {
    let newManifestId = manifest["id"];
    if (manifestId !== newManifestId) clearSelection();
  });
</script>

{#if manifest}
  <div class="results" class:full-page={fullPage}>
    {#if manifest["canvases"] && manifest["canvases"].length}
      <div class="canvas-list">
        {#each manifest["canvases"] as canvas, i}
          <div class="canvas-list-item">
            <div class="canvas-list-item-title auto-align">
              <h6>
                Image {i + 1} of {manifest["canvases"].length} - {canvas[
                  "label"
                ]["none"]}
              </h6>
              <button>Select</button>
            </div>
            <img
              alt={canvas["label"]["value"]}
              class="thumbnail-img"
              src={`https://image-uvic.canadiana.ca/iiif/2/${encodeURIComponent(
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
    {/if}
  </div>
{/if}

<!--
{#if manifest}
  <div class="results" class:full-page={fullPage}>
    <div class="manifest-title">
      <slot name="title" />
    </div>

    {#if manifest["canvases"] && manifest["canvases"].length}
      <div class="canvas-tiles auto-grid">
        {#each manifest["canvases"] as canvas}
          <CanvasSelectableCard
            {canvas}
            selected={selectedCanvases.includes(canvas)}
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
-->
<style>
  .results {
    width: 100%;
    height: 100%;
  }
  .results.full-page/*,
  .preview-wrap*/ {
    background-color: var(--backdrop-bg);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem 3rem;
  }

  .canvas-list {
    width: 100%;
    height: 100%;
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

  .canvas-list-item-title h6 {
    flex: 9;
  }

  .canvas-list img {
    width: 100%;
  }

  /*

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
  }*/
</style>
