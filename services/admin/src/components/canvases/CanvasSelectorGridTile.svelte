<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../shared/Align.svelte";
  import TiEye from "svelte-icons/ti/TiEye.svelte";
  import CanvasViewer from "./CanvasViewer.svelte";

  export let canvas: Canvas;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    selected = !selected;
    dispatch("tileClicked", { canvas });
  }

  function previewCanvas(event: any) {
    event.stopPropagation();
  }
</script>

<div class="canvas-tile" class:selected on:click={handleClick}>
  <img
    alt={canvas["label"]["none"]}
    src={`https://image-uvic.canadiana.ca/iiif/2/${encodeURIComponent(
      canvas["id"]
    )}/full/!425,524/0/default.jpg`}
  />

  <div class="canvas-tile-body">
    <Align>
      {#if selected}
        <input class="shadow" type="checkbox" checked />
      {/if}
      <div on:click={previewCanvas} class="canvas-preview-button shadow">
        <TiEye />
      </div>
    </Align>
  </div>
</div>

<div>
  <CanvasViewer {canvas} />
</div>

<style>
  .canvas-tile {
    display: inline-block;
    height: 564px;
    width: 425px;
    position: relative;
    margin: 1.5em;
    color: white;
    cursor: pointer;
  }

  .canvas-tile:hover img {
    filter: brightness(1.1);
  }

  .canvas-tile img {
    position: absolute;
    top: 0; /*50px;*/
    bottom: 0;
    left: 0;
    right: 0;
  }
  .canvas-tile.selected img {
    filter: sepia() hue-rotate(140deg) brightness(0.8);
    border-radius: 4px;
    border: 2px solid var(--teal);
  }

  .canvas-tile-body {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .canvas-preview-button {
    width: 2em;
    height: 2em;
    padding: 0 0 3px 0;
    color: var(--light-font);
    background-color: var(--grey);
    border-radius: 4px;
    margin: 4px 3px;
  }

  .canvas-preview-button:hover {
    background-color: #4e4e4e;
  }

  .canvas-tile.selected .canvas-preview-button {
    background: #699197;
  }
  @supports (-moz-appearance: none) {
    .canvas-tile.selected .canvas-preview-button {
      background: #7fabb4;
    }
  }

  .canvas-tile.selected .canvas-preview-button:hover {
    background: #597c81;
  }
  @supports (-moz-appearance: none) {
    .canvas-tile.selected .canvas-preview-button:hover {
      background: #699097;
    }
  }

  input[type="checkbox"] {
    width: 2.25em;
    height: 2.25em;
  }

  input[type="checkbox"]:checked {
    filter: sepia() hue-rotate(140deg) brightness(1.1) var(--shadow);
  }
</style>
