<script lang="ts">
  import TiArrowRight from "svelte-icons/ti/TiArrowRight.svelte";
  import { createEventDispatcher } from "svelte";
  import type { Manifest } from "@crkn-rcdr/access-data/src/access/Manifest";

  export let manifests: Manifest[] = [];
  export let title: string = "Manifests";

  const dispatch = createEventDispatcher();

  function handleClick(manifest: Manifest) {
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
        <td>
          {manifest["slug"]}: {manifest["label"]["none"]}
          <span
            class="visibility-hidden float__right auto-align auto-align__a-center action-message"
            >View and select canvases
            <div class="icon"><TiArrowRight /></div>
          </span></td
        >
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

  tbody tr:hover .action-message {
    visibility: visible !important;
  }

  .action-message {
    width: fit-content;
  }
</style>
