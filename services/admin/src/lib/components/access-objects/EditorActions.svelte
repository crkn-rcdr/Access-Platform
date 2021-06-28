<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { onMount } from "svelte";
  import equal from "fast-deep-equal";
  import { detailedDiff } from "deep-object-diff";

  export let object: AccessObject;
  export let objectModel: AccessObject;

  let clone: any;
  let saveEnabled = false;

  function checkModelChanged(objectModel: AccessObject) {
    saveEnabled = !equal(object, objectModel);
  }

  $: {
    checkModelChanged(objectModel);
  }

  function save() {
    let diff: any = detailedDiff(object, objectModel); //TODO: We can send this to the backend
    object = clone(objectModel);
    checkModelChanged(objectModel);
  }

  onMount(async () => {
    clone = (await import("rfdc")).default();
  });
</script>

<span class="editor-actions">
  {#if saveEnabled}
    <button class="save" on:click={save}>Save</button>
  {/if}
  <button class="secondary">{object["public"] ? "Unpublish" : "Publish"}</button
  >
</span>
