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
  import CanvasSelector from "./CanvasSelector.svelte";

  export let manifest: CanvasManifest;

  let activeCanvas: Canvas | null;

  let state = "view-content";

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
      <button
        class="primary"
        on:click={(e) => {
          state = "add";
        }}>add</button
      >
      <CanvasThumbnailList
        bind:canvases={manifest["canvases"]}
        on:thumbnailClicked={(e) => {
          setActiveCanvas(e.detail.index);
        }}
      />
    </div>
    {#if state === "add"}
      <CanvasSelector />
    {:else}
      <div>
        <CanvasViewer canvas={activeCanvas} />
      </div>
      <div>
        <CanvasLabelEditor
          bind:canvas={activeCanvas}
          on:changed={triggerUpdate}
        />
      </div>
    {/if}
  </Align>
{/if}

<style>
  div {
    height: 100%;
  }
  .list-wrapper {
    background-color: var(--structural-div-bg);
  }
</style>
