<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";

  export let canvas: Canvas;
  let OpenSeadragon: any;
  let container: HTMLDivElement;

  function clearViewer() {
    if (container) {
      container.innerHTML = "";
    }
  }

  async function drawImage() {
    clearViewer();
    if (canvas && OpenSeadragon) {
      OpenSeadragon.default({
        element: container,
        prefixUrl: "/openseadragon/images/", // for the icons the viewer uses
        tileSources: [
          `https://image-uvic.canadiana.ca/iiif/2/${encodeURIComponent(
            canvas["id"]
          )}/info.json`,
        ],
      });
    }
  }

  onMount(async () => {
    OpenSeadragon = await import("openseadragon");
    await drawImage();
  });

  afterUpdate(async () => {
    await drawImage();
  });
</script>

<div bind:this={container} />

<style>
  div {
    width: 100%;
    height: 100%;
  }

  :global(div[title="Zoom in"] img, div[title="Zoom out"]
      img, div[title="Go home"] img, div[title="Toggle full page"] img) {
    cursor: pointer;
  }

  :global(div[title="Zoom in"], div[title="Zoom out"], div[title="Go home"], div[title="Toggle full page"]) {
    margin-left: 0.25rem !important;
  }
</style>
