<script lang="ts">
  import { onMount, afterUpdate } from "svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/CanvasManifest";

  export let canvas: Canvas | null;
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
        id: "openseadragon-wrap",
        prefixUrl: "/openseadragon/images/", // for the icons the viewer uses
        tileSources: [
          `https://image-uvic.canadiana.ca/iiif/2/${canvas["id"]}/info.json`,
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

<div bind:this={container} id="openseadragon-wrap" />

<style>
  #openseadragon-wrap {
    background-color: var(--dark-grey);
    width: 100%;
    height: 100%;
  }
</style>
