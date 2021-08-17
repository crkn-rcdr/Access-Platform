<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import JsonTree from "$lib/components/shared/JsonTree.svelte";
  import Modal from "$lib/components/shared/Modal.svelte";
  export let dmdTask: SucceededDMDTask;
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
        {#if "access" in dmdTask["items"][0]}
          <th>Found in Access</th>
        {/if}
        {#if "preservation" in dmdTask["items"][0]}
          <th>Found in Preservation</th>
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
                  class="button secondary sm"
                  on:click={() => {
                    previewItem = item;
                    showJSONPreview = true;
                  }}>Preview</button
                >
              {:else}
                {item["message"]}
              {/if}
            </td>
            {#if "access" in item}
              <td>{item["access"]}</td>
            {/if}
            {#if "preservation" in item}
              <td>{item["preservation"]}</td>
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
