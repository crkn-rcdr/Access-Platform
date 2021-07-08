<script lang="ts">
  import { createEventDispatcher, onMount, afterUpdate } from "svelte";
  import type {
    Manifest,
    Canvas,
  } from "@crkn-rcdr/access-data/src/access/Manifest";
  import CanvasesViewer from "../canvases/CanvasesViewer.svelte";

  export let manifest: Manifest;
  export let fullPage = true;
  export let multiple = true;
  export let selectAll = false;
  export let selectedCanvases: Canvas[] = [];

  let manifestId = "";

  const dispatch = createEventDispatcher();

  function handleSelection() {
    dispatch("selected", { selectedCanvases });
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
      <div class="canvas-list-item-viewer">
        <CanvasesViewer
          bind:selectedCanvases
          bind:multiple
          bind:selectAll
          on:selected={handleSelection}
          canvases={manifest["canvases"]}
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

<style>
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
</style>
