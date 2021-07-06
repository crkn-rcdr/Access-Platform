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

<style>
  .canvas-preview-button {
    width: var(--perfect-fourth-5);
    height: var(--perfect-fourth-5);
    padding: 0 0 0.25rem 0;
    color: var(--light-font);
    background-color: var(--grey);
    border-radius: var(--border-radius);
    margin: 0.25rem;
    cursor: pointer;
  }
</style>
