<script lang="ts">
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  // fastest object operators?
  import equal from "fast-deep-equal";
  import { cloneDeep } from "lodash";

  export let manifest: CanvasManifest;
  export let manifestModel: CanvasManifest;

  let saveEnabled = false;

  function checkModelChanged(manifestModel: CanvasManifest) {
    saveEnabled = !equal(manifest, manifestModel);
  }

  $: {
    checkModelChanged(manifestModel);
  }

  function save() {
    manifest = cloneDeep(manifestModel);
    checkModelChanged(manifestModel);
  }
</script>

<span>
  {#if saveEnabled}
    <button class="save" on:click={save}>Save</button>
  {/if}
  <button class="secondary"
    >{manifest["public"] ? "Unpublish" : "Publish"}</button
  >
</span>
