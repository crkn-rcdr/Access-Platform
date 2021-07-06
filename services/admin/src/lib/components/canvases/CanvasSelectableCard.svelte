<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";
  import TiEye from "svelte-icons/ti/TiEye.svelte";
  import Card from "../shared/Card.svelte";

  export let canvas: Canvas;
  export let selected: boolean = false;
  export let disabled: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClick(event: any) {
    selected = event.detail.selected;
    dispatch("tileClicked", { canvas });
  }

  function previewCanvas(event: any) {
    event.stopPropagation();
    dispatch("tilePreviewClicked", { canvas });
  }
</script>

<div class="canvas-card">
  <Card
    on:clicked={handleClick}
    selectable={true}
    {disabled}
    imgURL={`https://image-uvic.canadiana.ca/iiif/2/${encodeURIComponent(
      canvas["id"]
    )}/full/!425,524/0/default.jpg`}
  >
    <div slot="action" on:click={previewCanvas} class="canvas-preview-button">
      <TiEye />
    </div>

    {canvas["label"]["none"]}
  </Card>
</div>

<style>
  .canvas-preview-button {
    width: var(--perfect-fourth-5);
    height: var(--perfect-fourth-5);
    padding: 0 0 0.25rem 0;
    color: var(--light-font);
    background-color: var(--teal); /*var(--grey);*/
    border-radius: var(--border-radius);
    margin: 0.25rem;
    cursor: pointer;
  }

  .canvas-card {
    height: calc(var(--perfect-fourth-1) * 4);
    width: calc(var(--perfect-fourth-1) * 3.7);
    margin: auto;
  }
  :global(.canvas-card .card) {
    width: 100%;
    height: 100%;
  }

  :global(.canvas-card .card-body) {
    display: flex;
    align-items: flex-end;
    background: rgba(0, 0, 0, 0.75);
    background: radial-gradient(transparent, #4a4a4a);
    color: white;
    font-style: italic;
    position: absolute;
    bottom: 0;
    top: 0;
    right: 0;
    left: 0;
    padding: 1rem;
    font-size: var(--perfect-fourth-8);
  }
</style>
