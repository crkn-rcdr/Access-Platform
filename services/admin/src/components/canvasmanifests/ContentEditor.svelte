<script lang="ts">
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../shared/Align.svelte";
  import CanvasLabelEditor from "../canvases/CanvasLabelEditor.svelte";
  import CanvasViewer from "../canvases/CanvasViewer.svelte";
  import CanvasThumbnailList from "../canvases/CanvasThumbnailList.svelte";

  export let manifest: CanvasManifest;
</script>

<Align>
  <div>
    <CanvasThumbnailList bind:canvases={manifest["canvases"]} />
  </div>
  <div>
    <CanvasViewer />
  </div>
  <div>
    <CanvasLabelEditor />
  </div>
</Align>

<style>
  div {
    height: 100%;
  }
</style>
