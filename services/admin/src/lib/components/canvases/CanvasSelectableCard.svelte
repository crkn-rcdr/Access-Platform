<!--
@component
### Overview
Displays a card for a canvas, containing it's thumbnail, label, a preview button, and a checkbox input allowing the user to be able to select it.

### Properties
|    |    |    |
| -- | -- | -- |
| canvas: any        | required | The canvas to be displayed |
| selected: boolean  | optional | if the canvas is selected |

### Usage
**Example one**
```  
<CanvasSelectableCard {canvas} 
on:selected={(event) => {console.logs(event.detail)}} 
on:previewClicked={(event) => {console.logs(event.detail)}}/>
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import TiEye from "svelte-icons/ti/TiEye.svelte";
  import Card from "$lib/components/shared/Card.svelte";

  /**
   * @type {any} The canvas to be displayed
   */
  export let canvas: any; // TODO: should we make an ObjectListItem type?

  /**
   * @type {boolean} If the canvas is selected.
   */
  export let selected: boolean = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * The method triggers a @event selected which outputs the canvas that was selected in its event.detail.
   * @returns void
   */
  function handleClick() {
    dispatch("selected", { canvas });
  }

  /**
   * The method triggers a @event previewClicked which outputs the canvas that was selected in its event.detail.
   * @param event
   * @returns void
   */
  function previewCanvas(event: any) {
    event.stopPropagation();
    dispatch("previewClicked", { canvas });
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
