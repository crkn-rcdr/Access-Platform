<script lang="ts">
  import type {
    CanvasManifest,
    Canvas,
  } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../shared/Align.svelte";
  import CanvasLabelEditor from "../canvases/CanvasLabelEditor.svelte";
  import CanvasViewer from "../canvases/CanvasViewer.svelte";
  import CanvasThumbnailList from "../canvases/CanvasThumbnailList.svelte";
  import { onMount } from "svelte";

  export let manifest: CanvasManifest;

  let activeCanvas: Canvas;

  function setActiveCanvas(index) {
    if (manifest && index < manifest.canvases.length)
      activeCanvas = manifest.canvases[index];
  }

  function triggerUpdate() {
    manifest.canvases = manifest.canvases;
  }

  onMount(() => {
    if (manifest && manifest.canvases.length)
      activeCanvas = manifest.canvases[0];
  });
</script>

{#if manifest}
  <Align>
    <div>
      <CanvasThumbnailList
        bind:canvases={manifest["canvases"]}
        on:thumbnailClicked={(e) => {
          setActiveCanvas(e.detail.index);
        }}
      />
    </div>
    <div>
      <CanvasViewer />
    </div>
    <div>
      <CanvasLabelEditor
        bind:canvas={activeCanvas}
        on:changed={triggerUpdate}
      />
    </div>
  </Align>
{/if}

<style>
  div {
    height: 100%;
  }
</style>
