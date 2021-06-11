<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import CanvasSelectorGridTile from "../canvases/CanvasSelectorGridTile.svelte";
  import Align from "../shared/Align.svelte";

  export let manifest: CanvasManifest;
  let selectedCanvases: Canvas[] = [];

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

{selectedCanvases.length}
{#if manifest}
  <div class="results">
    <div class="manifest-title">
      <Align vertical="center">
        <div class="back-button" on:click={handleBackButtonPressed}>
          <TiArrowBack />
        </div>
        <h5>
          {manifest["slug"]}: {manifest["label"]["none"]}
        </h5>

        <div class="action-buttons">
          {#if selectedCanvases.length}
            <button class="primary" on:click={handleAddPressed}
              >Add Canvas{selectedCanvases.length > 1 ? "es" : ""}</button
            >
          {/if}
        </div>
      </Align>
    </div>

    <div class="canvas-tiles">
      {#each manifest["canvases"] as canvas}
        <CanvasSelectorGridTile {canvas} on:tileClicked={handleSelection} />
      {/each}
    </div>
  </div>
{/if}

<style>
  .results {
    background: black;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2em 3em;
  }

  h5 {
    margin-bottom: 0 !important;
    flex: 9;
  }

  .manifest-title {
    color: var(--light-font);
    padding: 1em !important;
  }

  .canvas-tiles {
    height: 70vh;
    overflow-y: auto;
  }

  .back-button {
    width: 2em;
    height: 2em;
    margin-right: 1em;
    cursor: pointer;
    border-radius: 4px;
  }

  .back-button:hover {
    background-color: #111111;
  }
</style>
