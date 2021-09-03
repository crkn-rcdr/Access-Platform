<!--
@component
### Overview
This component displays the items in the dmd task throughout the various stages of completing the dmd task process in a table view.

### Properties
|    |    |    |
| -- | -- | -- |
| accessPlatform: AccessPlatform | required | The access platform the items are in. |
| itemsToShow: ParseRecord[] | optional | The dmdtask items to be displayed. |
| $dmdTasksStore[dmdTaskId].itemStates: (DmdLoadedParseRecord or DmdUpdatedParseRecord)[] | optional | The dmdtask items lookup and update results. Indexing exactly matches the itemsToShow |
| showAccessLookupColumn: boolean | optional | If the access lookup column should be displayed of not. The displaying of the column depends on user selections in parent and sibling components. |
| showPreservationLookupColumn: boolean | optional | If the preservation lookup column should be displayed of not. The displaying of the column depends on user selections in parent and sibling components. |
| showAccessUpdateColumn: boolean | optional | If the access update column should be displayed of not. The displaying of the column depends on user selections in parent and sibling components. |
| showPreservationUpdateColumn: boolean | optional | If the preservation update column should be displayed of not. The displaying of the column depends on user selections in parent and sibling components. |

### Usage
```
<DmdItemsTable
    bind:itemsToShow={dmdTask.items}
    bind:accessPlatform
    bind:$dmdTasksStore[dmdTaskId].itemStates
    bind:showAccessLookupColumn
    bind:showPreservationLookupColumn
    bind:showAccessUpdateColumn
    bind:showPreservationUpdateColumn
  />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { AccessPlatform } from "$lib/types";
  import type { ParseRecord } from "@crkn-rcdr/access-data/dist/esm/dmd/Task";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";
  import DmdSuccessItemPreview from "./DmdSuccessItemPreview.svelte";

  /**
   *  @type { string } The 'id' of the DMDTask being shown.
   */
  export let dmdTaskId: string;

  /**
   *  @type { AccessPlatform } The access platform the items are in.
   */
  export let accessPlatform: AccessPlatform;

  /**
   *  @type { ParseRecord[]  } The dmdtask items to be displayed.
   */
  export let itemsToShow: ParseRecord[] = [];

  /**
   * @type { boolean } if the json preview modal should be displayed for an item in the table.
   */
  let openPreviewModal: boolean = false;

  let previewItemIndex: number | undefined = undefined;

  let shouldUpdateAllItems: boolean = true;

  /**
   * Handles showing the json preview modal for the item passed in
   * @param item
   * @returns void
   */
  async function handlePreviewItemPressed(index: number) {
    openPreviewModal = true;
    previewItemIndex = index;
    console.log(openPreviewModal, previewItemIndex);
  }

  function toggleAllItemsSelected() {
    shouldUpdateAllItems = !shouldUpdateAllItems;
    dmdTasksStore.toggleAllItemsSelected(dmdTaskId, shouldUpdateAllItems);
  }

  function checkIfAllItemsSelected(event) {
    if (event.target.checked) {
      shouldUpdateAllItems =
        dmdTasksStore.checkIfAllTaskItemsSelected(dmdTaskId);
    } else shouldUpdateAllItems = false;
  }
</script>

{#if itemsToShow.length && dmdTasksStore && $dmdTasksStore[dmdTaskId]}
  <table>
    <thead>
      <tr>
        {#if $dmdTasksStore[dmdTaskId].lookupState === "loaded" && ($dmdTasksStore[dmdTaskId].shouldUpdateInAccess || $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation)}
          <th>
            <input
              type="checkbox"
              on:click={toggleAllItemsSelected}
              bind:checked={shouldUpdateAllItems}
            />
          </th>
        {/if}
        <th>Id</th>
        <th>Label</th>
        <th>Valid</th>
        <th>Preview Metadata</th>

        {#if $dmdTasksStore[dmdTaskId].lookupState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
          <th>Found in {accessPlatform.label}?</th>
        {/if}
        {#if $dmdTasksStore[dmdTaskId].updateState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
          <th>Updated in {accessPlatform.label}?</th>
        {/if}

        {#if $dmdTasksStore[dmdTaskId].lookupState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
          <th>Found in Preservation?</th>
        {/if}
        {#if $dmdTasksStore[dmdTaskId].updateState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
          <th>Updated in Preservation?</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each itemsToShow as item, i}
        {#if typeof item === "object"}
          <tr>
            {#if $dmdTasksStore[dmdTaskId].lookupState === "loaded" && ($dmdTasksStore[dmdTaskId].shouldUpdateInAccess || $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation)}
              <td>
                <input
                  type="checkbox"
                  bind:checked={$dmdTasksStore[dmdTaskId].itemStates[item["id"]]
                    .shouldUpdate}
                  on:change={checkIfAllItemsSelected}
                />
              </td>
            {/if}
            <td>{item["id"]}</td>
            <td>{item["label"]}</td>
            <td>
              {$dmdTasksStore[dmdTaskId].itemStates[item["id"]].parseSuccess
                ? "Yes"
                : "No"}
            </td>
            <td>
              {#if item["parsed"]}
                <button
                  class="button ghost dark sm"
                  on:click={() => handlePreviewItemPressed(i)}>Preview</button
                >
              {:else}
                {item["message"]}
              {/if}
            </td>

            {#if $dmdTasksStore[dmdTaskId].itemStates[item["id"]]}
              {#if $dmdTasksStore[dmdTaskId].lookupState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
                <td
                  class:success={$dmdTasksStore[dmdTaskId].itemStates[
                    item["id"]
                  ].foundInAccess === "Yes"}
                  class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                    item["id"]
                  ].foundInAccess === "No"}
                >
                  {#if $dmdTasksStore[dmdTaskId].itemStates[item["id"]].noid}
                    <a
                      href={`/object/${
                        $dmdTasksStore[dmdTaskId].itemStates[item["id"]].noid
                      }`}
                      target="_blank"
                    >
                      {$dmdTasksStore[dmdTaskId].itemStates[item["id"]]
                        .foundInAccess}
                    </a>
                  {:else}
                    {$dmdTasksStore[dmdTaskId].itemStates[item["id"]]
                      .foundInAccess}
                  {/if}
                </td>
              {/if}

              {#if $dmdTasksStore[dmdTaskId].updateState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
                <td
                  class:success={$dmdTasksStore[dmdTaskId].itemStates[
                    item["id"]
                  ].updatedInAccess === "Yes"}
                  class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                    item["id"]
                  ].updatedInAccess === "No"}
                >
                  {$dmdTasksStore[dmdTaskId].itemStates[item["id"]]
                    .updatedInAccess}
                </td>
              {/if}

              {#if $dmdTasksStore[dmdTaskId].lookupState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
                <td
                  class:success={$dmdTasksStore[dmdTaskId].itemStates[
                    item["id"]
                  ].foundInPreservation === "Yes"}
                  class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                    item["id"]
                  ].foundInPreservation === "No"}
                >
                  {$dmdTasksStore[dmdTaskId].itemStates[item["id"]]
                    .foundInPreservation}
                </td>
              {/if}

              {#if $dmdTasksStore[dmdTaskId].updateState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
                <td
                  class:success={$dmdTasksStore[dmdTaskId].itemStates[
                    item["id"]
                  ].updatedInPreservation === "Yes"}
                  class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                    item["id"]
                  ].updatedInPreservation === "No"}
                >
                  {$dmdTasksStore[dmdTaskId].itemStates[item["id"]]
                    .updatedInPreservation}
                </td>
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

<DmdSuccessItemPreview
  {dmdTaskId}
  bind:openPreviewModal
  bind:previewItemIndex
/>

<style>
  .success {
    background-color: var(--success-light);
  }
  .not-success {
    background-color: var(--danger-light);
  }
</style>
