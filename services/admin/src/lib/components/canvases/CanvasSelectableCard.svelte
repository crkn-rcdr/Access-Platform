<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  //import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";
  import TiEye from "svelte-icons/ti/TiEye.svelte";
  import Card from "../shared/Card.svelte";

  /**
   * @type {string} Slug being resolved.
   */
  export let canvas: any; // TODO: should we make an ObjectListItem type?

  /**
   * @type {string} Slug being resolved.
   */
  export let selected: boolean = false;

  /**
   * @type {string} Slug being resolved.
   */
  const dispatch = createEventDispatcher();

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function handleClick() {
    dispatch("tileClicked", { canvas });
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function previewCanvas(event: any) {
    event.stopPropagation();
    dispatch("tilePreviewClicked", { canvas });
  }
</script>

<div class="canvas-card">
  <Card
    on:clicked={handleClick}
    selectable={true}
    {selected}
    imgURL={`https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
      canvas["id"]
    )}/full/!425,524/0/default.jpg`}
  >
    <div slot="action" on:click={previewCanvas} class="canvas-preview-button">
      <TiEye />
    </div>

    <!--div class="label-text">
      {canvas["label"]["none"]}
    </div-->
  </Card>
</div>

<style>
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
    opacity: 0.4;
  }
  /*
  :global(.canvas-card:hover .card-body) {
    opacity: 0.4;
  }

  :global(.canvas-card:hover .label-text) {
    display: none;
  }*/

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
</style>
