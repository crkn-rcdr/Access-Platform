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
  import { onMount, afterUpdate } from "svelte";
  //import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";

  /**
   * @type {string} Slug being resolved.
   */
  export let canvas: any; // TODO: should we make an ObjectListItem type?

  /**
   * @type {string} Slug being resolved.
   */
  export let options: any = {};

  /**
   * @type {string} Slug being resolved.
   */
  let OpenSeadragon: any;

  /**
   * @type {string} Slug being resolved.
   */
  let container: HTMLDivElement;

  /**
   * @type {string} Slug being resolved.
   */
  let imageURL = "";

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function clearViewer() {
    if (container) {
      container.innerHTML = "";
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  async function drawImage() {
    clearViewer();
    if (canvas && OpenSeadragon) {
      imageURL = `https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
        canvas["id"]
      )}/info.json`;
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
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  onMount(async () => {
    OpenSeadragon = await import("openseadragon");
    await drawImage();
  });

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
