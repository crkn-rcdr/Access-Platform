<script lang="ts">
  // if we kept AccessObject in the import above, the code fails on the client. always use `import type` with types
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import { onMount } from "svelte";
  import equal from "fast-deep-equal";
  //import { detailedDiff } from "deep-object-diff";

  export let manifest: AccessObject;
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

<!--{JSON.stringify(detailedDiff(manifest, manifestModel))}-->
<span>
  {#if saveEnabled}
    <button class="save" on:click={save}>Save</button>
  {/if}
  <button class="secondary"
    >{manifest["public"] ? "Unpublish" : "Publish"}</button
  >
</span>
