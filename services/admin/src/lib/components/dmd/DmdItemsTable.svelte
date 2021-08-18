<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import JsonTree from "$lib/components/shared/JsonTree.svelte";
  import Modal from "$lib/components/shared/Modal.svelte";
  export let dmdTask: SucceededDMDTask;
  export let showAccessLookupColumn: boolean = false;
  export let showPreservationLookupColumn: boolean = false;
  export let showAccessUpdateColumn: boolean = false;
  export let showPreservationUpdateColumn: boolean = false;
  export let depositor: { string: string; label: string };
  export let lookupResults: any = {};
  export let updateResults: any = {};

  let showJSONPreview = false;
  let previewItem;
</script>

{#if dmdTask?.["items"]?.length}
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Label</th>
        <th>Valid</th>

        {#if showAccessLookupColumn}
          <th>Found in {depositor.label}?</th>
        {/if}
        {#if showAccessUpdateColumn}
          <th>Updated in {depositor.label}?</th>
        {/if}

        {#if showPreservationLookupColumn}
          <th>Found in Preservation?</th>
        {/if}
        {#if showPreservationUpdateColumn}
          <th>Updated in Preservation?</th>
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

            {#if showAccessLookupColumn}
              {#if lookupResults.access[`${depositor.string}.${item.id}`]?.found}
                <td class="success">
                  <a
                    href={`/object/${
                      lookupResults.access[`${depositor.string}.${item.id}`]
                        .result.id
                    }`}
                    target="_blank">Yes</a
                  >
                </td>
              {:else}
                <td class="not-success"> No </td>
              {/if}
            {/if}

            {#if showAccessUpdateColumn}
              {#if `${depositor.string}.${item.id}` in updateResults.access}
                {#if updateResults.access[`${depositor.string}.${item.id}`]}
                  <td class="success">Yes</td>
                {:else}
                  <td class="not-success">No</td>
                {/if}
              {:else}
                <td class="">Updating...</td>
              {/if}
            {/if}

            {#if showPreservationLookupColumn}
              {#if lookupResults.preservation[`${depositor.string}.${item.id}`]?.found}
                <td class="success">Yes</td>
              {:else}
                <td class="not-success">No</td>
              {/if}
            {/if}

            {#if showPreservationUpdateColumn}
              <td class="not-success">No</td>
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
  .success {
    background-color: var(--success-light);
  }
  .not-success {
    background-color: var(--danger-light);
  }
</style>
