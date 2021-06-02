<script>
  import { onMount, afterUpdate } from "svelte";

  export let canvas;
  let OpenSeadragon;
  let viewer;
  let container;

  async function drawImage() {
    if (canvas) {
      console.log("called");
      if (OpenSeadragon) {
        if (container) {
          container.innerHTML = "";
        }
        console.log("called 2");
        viewer = OpenSeadragon.default({
          id: "openseadragon-wrap",
          prefixUrl: "/openseadragon/images/",
          preserveViewport: true,
          visibilityRatio: 1,
          minZoomLevel: 1,
          defaultZoomLevel: 1,
          sequenceMode: false,
          tileSources: [
            `https://image-uvic.canadiana.ca/iiif/2/${canvas["id"]}/info.json`,
          ],
        });
      }
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
    width: 595px;
    height: 100%;
  }
</style>
