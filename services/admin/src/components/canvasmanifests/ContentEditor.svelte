<script lang="ts">
  import { onMount } from "svelte";
  import type {
    CanvasManifest,
    Canvas,
  } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../shared/Align.svelte";
  import CanvasLabelEditor from "../canvases/CanvasLabelEditor.svelte";
  import CanvasViewer from "../canvases/CanvasViewer.svelte";
  import CanvasThumbnailList from "../canvases/CanvasThumbnailList.svelte";

  export let manifest: CanvasManifest;

  let activeCanvas: Canvas | null;

  function setActiveCanvas(index: number) {
    activeCanvas = manifest?.canvases?.[index] || null;
    triggerUpdate();
  }

  function triggerUpdate() {
    manifest.canvases = manifest.canvases;
  }

  onMount(() => {
    activeCanvas = manifest?.canvases?.[0] || null;
  });
</script>

{#if manifest}
  <Align>
    <div class="list-wrapper">
      <CanvasThumbnailList
        bind:canvases={manifest["canvases"]}
        on:thumbnailClicked={(e) => {
          setActiveCanvas(e.detail.index);
        }}
      />
    </div>
    <div class="view-wrap">
      <CanvasViewer canvas={activeCanvas} />
    </div>
    <div class="label-wrap">
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

  .list-wrapper {
    background-color: var(--structural-div-bg);
    flex: 2.5;
  }

  .view-wrap {
    flex: 4.8;
  }

  .label-wrap {
    flex: 2.7;
  }
</style>
