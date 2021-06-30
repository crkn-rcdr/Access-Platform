<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";
  import TiEye from "svelte-icons/ti/TiEye.svelte";
  import Card from "../shared/Card.svelte";

  export let canvas: Canvas;
  export let selected: boolean = false;
  export let disabled: boolean = false;

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

<Card
  on:clicked={handleClick}
  selectable={true}
  {disabled}
  name={`${canvas["id"]}`}
  imgURL={`https://image-uvic.canadiana.ca/iiif/2/${encodeURIComponent(
    canvas["id"]
  )}/full/!425,524/0/default.jpg`}
>
  <div on:click={previewCanvas} class="canvas-preview-button shadow">
    <TiEye />
  </div>
</Card>

<style>
  .canvas-preview-button {
    position: absolute;
    top: 0.5rem;
    right: 1rem;
    width: var(--perfect-fourth-5);
    height: var(--perfect-fourth-5);
    padding: 0 0 0.25rem 0;
    color: var(--light-font);
    background-color: var(--secondary);
    border-radius: var(--border-radius);
    margin: 0.25rem;
  }

  .canvas-preview-button:hover {
    background-color: #4e4e4e;
  }
</style>
