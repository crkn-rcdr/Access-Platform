<script lang="ts">
  import type { AccessPlatform } from "$lib/types";
  import type { ParseRecord } from "@crkn-rcdr/access-data/dist/esm/dmd/Task";
  import JsonTree from "$lib/components/shared/JsonTree.svelte";
  import Modal from "$lib/components/shared/Modal.svelte";

  /**
   *  @type { ParseRecord[]  } The dmdtask items to be displayed.
   */
  export let itemsToShow: ParseRecord[] = [];

  /**
   *  @type { (
    | DmdLoadedParseRecord
    | DmdUpdatedParseRecord
  )[] } The dmdtask items lookup and update results. Indexing exactly matches the @var itemsToShow
   */
  export let itemsLookupAndUpdateResults = [];

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  export let accessPlatform: AccessPlatform;

  /**
   * @type { boolean } If the access lookup column should be displayed of not. The displaying of the column depends on user selections in parent and sibling components.
   */
  export let showAccessLookupColumn: boolean = false;

  /**
   * @type { boolean } If the preservation lookup column should be displayed of not. The displaying of the column depends on user selections in parent and sibling components.
   */
  export let showPreservationLookupColumn: boolean = false;

  /**
   * @type { boolean } If the access update column should be displayed of not. The displaying of the column depends on user selections in parent and sibling components.
   */
  export let showAccessUpdateColumn: boolean = false;

  /**
   * @type { boolean } If the preservation update column should be displayed of not. The displaying of the column depends on user selections in parent and sibling components.
   */
  export let showPreservationUpdateColumn: boolean = false;

  /**
   * @type { boolean } if the json preview modal should be displayed for an item in the table.
   */
  let showItemJsonPreview: boolean = false;

  /**
   * @type { ParseRecord } the item with json in the preview modal.
   */
  let itemBeingPreviewed: ParseRecord;

  /**
   * Handles showing the json preview modal for the item passed in
   * @param item
   * @returns void
   */
  function handlePreviewItemPressed(item: ParseRecord) {
    itemBeingPreviewed = item;
    showItemJsonPreview = true;
  }
</script>

{#if itemsToShow.length}
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Label</th>
        <th>Valid</th>

        {#if showAccessLookupColumn}
          <th>Found in {accessPlatform.label}?</th>
        {/if}
        {#if showAccessUpdateColumn}
          <th>Updated in {accessPlatform.label}?</th>
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
      {#each itemsToShow as item, i}
        {#if typeof item === "object"}
          <tr>
            <td>{item["id"]}</td>
            <td>{item["label"]}</td>
            <td>
              {#if item["parsed"]}
                <button
                  class="button ghost dark sm"
                  on:click={() => handlePreviewItemPressed(item)}
                  >Preview</button
                >
              {:else}
                {item["message"]}
              {/if}
            </td>

            {#if showAccessLookupColumn && i < itemsLookupAndUpdateResults.length}
              {#if itemsLookupAndUpdateResults[i].foundInAccess}
                <td class="success">
                  <a
                    href={`/object/${itemsLookupAndUpdateResults[i].noid}`}
                    target="_blank">Yes</a
                  >
                </td>
              {:else}
                <td class="not-success"> No </td>
              {/if}
            {/if}

            {#if showAccessUpdateColumn}
              {#if "updatedInAccess" in itemsLookupAndUpdateResults[i]}
                {#if itemsLookupAndUpdateResults[i].updatedInAccess}
                  <td class="success">Yes</td>
                {:else}
                  <td class="not-success">No</td>
                {/if}
              {:else}
                <td class="">Updating...</td>
              {/if}
            {/if}

            {#if showPreservationLookupColumn}
              {#if itemsLookupAndUpdateResults[i].foundInPreservation}
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

<!--dmdtask.fetchResult-->
<Modal bind:open={showItemJsonPreview} title={`Preview JSON`} size="lg">
  <div slot="body" class="code-block">
    <JsonTree value={{ object: JSON.parse(itemBeingPreviewed["message"]) }} />
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
