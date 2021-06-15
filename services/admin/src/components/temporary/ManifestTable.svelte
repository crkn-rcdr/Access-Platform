<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";

  export let manifests: CanvasManifest[] = [];
  export let title: string = "Manifests";

  const dispatch = createEventDispatcher();

  function handleClick(manifest: CanvasManifest) {
    dispatch("rowClicked", { manifest });
  }
</script>

<table>
  <thead>
    <tr>
      <th>{title}</th>
    </tr>
  </thead>
  <tbody>
    {#each manifests as manifest}
      <tr on:click={() => handleClick(manifest)}>
        <td>{manifest["slug"]}: {manifest["label"]["none"]}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    margin-top: 1em;
  }

  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background-color: rgb(241, 241, 241);
  }
</style>
