<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import JsonTree from "$lib/components/shared/JsonTree.svelte";
  import Modal from "$lib/components/shared/Modal.svelte";
  export let dmdTask: SucceededDMDTask;
  export let showAccessColumn: boolean = false;
  export let showPreservationColumn: boolean = false;
  export let depositor: { string: string; label: string };
  export let lookupResults: any = {};

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
        {#if showAccessColumn}
          <th>Found in {depositor.label}?</th>
        {/if}
        {#if showPreservationColumn}
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

            {#if showAccessColumn}
              {#if lookupResults.access[`${depositor.string}.${item.id}`]?.found}
                <td class="found">
                  <a
                    href={`/object/${
                      lookupResults.access[`${depositor.string}.${item.id}`]
                        .result.id
                    }`}
                    target="_blank">Yes</a
                  >
                </td>
              {:else}
                <td class="not-found"> No </td>
              {/if}
            {/if}

            {#if showPreservationColumn}
              {#if lookupResults.preservation[`${depositor.string}.${item.id}`]?.found}
                <td class="found">Yes</td>
              {:else}
                <td class="not-found">No</td>
              {/if}
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
