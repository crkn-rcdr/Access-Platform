<script lang="ts">
  import { onMount } from "svelte";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import equal from "fast-deep-equal";

  export let manifest: CanvasManifest;
  export let manifestModel: CanvasManifest;

  let clone: any;
  let saveEnabled = false;

  function checkModelChanged(manifestModel: CanvasManifest) {
    saveEnabled = !equal(manifest, manifestModel);
  }

  $: {
    checkModelChanged(manifestModel);
  }

  function save() {
    manifest = clone(manifestModel);
    checkModelChanged(manifestModel);
  }

  onMount(async () => {
    clone = (await import("rfdc")).default();
  });
</script>

<span>
  {#if saveEnabled}
    <button class="save" on:click={save}>Save</button>
  {/if}
  <button class="secondary"
    >{manifest["public"] ? "Unpublish" : "Publish"}</button
  >
</span>
