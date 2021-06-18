<script lang="ts">
  // if we kept AccessObject in the import above, the code fails on the client. always use `import type` with types
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { onMount } from "svelte";
  import equal from "fast-deep-equal";
  import { detailedDiff } from "deep-object-diff";

  export let object: AccessObject;
  export let model: AccessObject;

  let clone: any;
  let saveEnabled = false;

  function checkModelChanged(model: AccessObject) {
    saveEnabled = !equal(object, model);
    console.log(saveEnabled, object, model);
  }

  $: {
    checkModelChanged(model);
  }

  function save() {
    let diff: any = detailedDiff(object, model); //TODO: We can send this to the backend
    //console.log("changes:", diff);
    object = clone(model);
    checkModelChanged(model);
  }

  onMount(async () => {
    clone = (await import("rfdc")).default();
  });
</script>

<span>
  {#if saveEnabled}
    <button class="save" on:click={save}>Save</button>
  {/if}
  <button class="secondary">{object["public"] ? "Unpublish" : "Publish"}</button
  >
</span>
