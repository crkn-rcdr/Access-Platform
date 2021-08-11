<!--
@component
### Overview
Displays a canvas using the OpenSeadragon library

### Properties
|    |    |    |
| -- | -- | -- |
| canvases: ObjectList   | required | The canvas to be displayed. |
| options: any           | optional | The openseadragon viewer options, @see https://openseadragon.github.io/docs/OpenSeadragon.html#.Options) for more oopenseadragon options. |

### Usage
```  
<CanvasViewer {canvas} />
```
-->
<script lang="ts">
  import { onMount, afterUpdate } from "svelte";

  /**
   * @type {any} The canvas to be displayed.
   */
  export let canvas: any; // TODO: should we make an ObjectListItem type?

  /**
   * @type {any} The openseadragon viewer options, @see https://openseadragon.github.io/docs/OpenSeadragon.html#.Options) for more oopenseadragon options.
   */
  export let options: any = {};

  /**
   * @type {any} The OpenSeadragon module.
   */
  let OpenSeadragon: any;

  /**
   * @type {HTMLDivElement} The html element to attach the openseadragon viewer to.
   */
  let container: HTMLDivElement;

  /**
   * @type {string} The image api string url for the canvas.
   */
  let imageURL = "";

  /**
   * Clears the element containing the openseadragon canvas viewer
   * @returns void
   */
  function clearViewer() {
    if (container) {
      container.innerHTML = "";
    }
  }

  /**
   * Calls @function clearViewer to remove any old instantiations of the openseadragon viewer, then uses the options passed into this component to create a new openseadragon viewer, and attach it to the container.
   * @returns void
   */
  async function drawImage() {
    clearViewer();
    if (canvas && OpenSeadragon) {
      imageURL = `https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
        canvas["id"]
      )}/info.json`;
      try {
        OpenSeadragon.default({
          element: container,
          prefixUrl: "/openseadragon/images/", // for the icons the viewer uses
          tileSources: [imageURL],
          viewportMargins: {
            top: 0,
            bottom: 0,
          },
          immediateRender: true,
          ...options,
        });
      } catch (e) {
        console.log("OpenSeadragon error:", e);
      }
    }
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var OpenSeadragon is instantiated, and the canvas is drawn by calling @function drawImage()
   */
  onMount(async () => {
    OpenSeadragon = await import("openseadragon");
    await drawImage();
  });

  /**
   * @event afterUpdate
   * @description When the component paramters are updated, the @var imageURL is compared to the new image URLgenerated fronm the current @var canvas id, if they are different (meaning the @var canvas is not the same canvas as before) the new canvas is drawn by calling @function drawImage()
   */
  afterUpdate(async () => {
    let newImageUrl = `https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
      canvas["id"]
    )}/info.json`;
    if (imageURL !== newImageUrl) await drawImage();
  });
</script>

<div bind:this={container} />

<style>
  div {
    width: 100%;
    height: 100%;
  }

  /* These configure the display of the OpenSeadragon navigator */
  /* svelte :global directives only allow for one specifier at a time */
  div :global(div[title="Zoom in"] img) {
    cursor: pointer;
    opacity: 0.5;
  }

  div :global(div[title="Go home"] img) {
    cursor: pointer;
    margin-left: 0.25rem !important;
  }

  div :global(div[title="Toggle full page"] img) {
    cursor: pointer;
    margin-left: 0.25rem !important;
  }
</style>
