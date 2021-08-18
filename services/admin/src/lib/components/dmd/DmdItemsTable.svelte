<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import JsonTree from "$lib/components/shared/JsonTree.svelte";
  import Modal from "$lib/components/shared/Modal.svelte";
  export let dmdTask: SucceededDMDTask;
  export let showAccessColumn: boolean = false;
  export let showPreservationColumn: boolean = false;
  export let accessLabel: string = "Access";

  let showJSONPreview = false;
  let previewItem;
</script>

{#if dmdTask?.["items"]?.length}
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Label</th>
        <th>Value</th>
        {#if showAccessColumn && "access" in dmdTask["items"][0]}
          <th>Found in {accessLabel}?</th>
        {/if}
        {#if showPreservationColumn && "preservation" in dmdTask["items"][0]}
          <th>Found in Preservation?</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each dmdTask["items"] as item}
        {#if typeof item === "object"}
          <tr>
            <td>{item["id"]}</td>
            <td>{item["label"]}</td>
            <td>
              {#if item["parsed"]}
                <button
                  class="button ghost dark sm"
                  on:click={() => {
                    previewItem = item;
                    showJSONPreview = true;
                  }}>Preview</button
                >
              {:else}
                {item["message"]}
              {/if}
            </td>
            {#if showAccessColumn && "access" in item}
              <td class:found={item["access"]} class:not-found={!item["access"]}
                >{item["access"] ? "Yes" : "No"}</td
              >
            {/if}
            {#if showPreservationColumn && "preservation" in item}
              <td
                class:found={item["preservation"]}
                class:not-found={!item["preservation"]}
                >{item["preservation"] ? "Yes" : "No"}</td
              >
            {/if}
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
{:else}
  No items.
{/if}

<Modal bind:open={showJSONPreview} title={`Preview JSON`} size="lg">
  <div slot="body" class="code-block">
    <JsonTree value={{ object: JSON.parse(previewItem["message"]) }} />
  </div>
</Modal>

<style>
  .found {
    background-color: var(--success-light);
  }
  .not-found {
    background-color: var(--danger-light);
  }
</style>
