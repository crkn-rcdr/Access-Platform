<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";
  import TiEye from "svelte-icons/ti/TiEye.svelte";

  export let canvas: Canvas;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClick() {
    selected = !selected;
    dispatch("tileClicked", { canvas });
  }

  function previewCanvas(event: any) {
    event.stopPropagation();
    dispatch("tilePreviewClicked", { canvas });
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
    <div class="auto-align">
      {#if selected}
        <input class="shadow" type="checkbox" checked />
      {/if}
      <div on:click={previewCanvas} class="canvas-preview-button shadow">
        <TiEye />
      </div>
    </div>
  </div>
</div>

<style>
  .canvas-tile {
    display: inline-block;
    height: 564px;
    width: 425px;
    position: relative;
    margin: var(--perfect-fourth-6) var(--perfect-fourth-4);
    color: white;
    cursor: pointer;
  }

  .canvas-tile:hover img {
    filter: brightness(1.1);
  }

  .canvas-tile img {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
  .canvas-tile.selected img {
    filter: sepia() hue-rotate(140deg) brightness(0.8);
    border-radius: var(--border-radius);
    border: 0.125rem solid var(--teal);
  }

  .canvas-tile-body {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .canvas-preview-button {
    width: var(--perfect-fourth-5);
    height: var(--perfect-fourth-5);
    padding: 0 0 0.25rem 0;
    color: var(--light-font);
    background-color: var(--grey);
    border-radius: var(--border-radius);
    margin: 0.25rem;
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
    width: var(--perfect-fourth-5);
    height: var(--perfect-fourth-5);
  }

  input[type="checkbox"]:checked {
    filter: sepia() hue-rotate(140deg) brightness(1.1) var(--shadow);
  }
</style>
