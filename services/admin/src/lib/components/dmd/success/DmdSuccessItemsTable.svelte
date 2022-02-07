<!--
@component
### Overview
This component displays the items in the dmd task throughout the various stages of completing the dmd task process in a table view.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTaskId: string | required | The id of the dmd task. |
| depositor: Depositor | required | The access platform the items are in. |
| itemsToShow: ParseRecord[] | optional | The dmdtask items to be displayed. |

### Usage
```
<DmdItemsTable
    dmdTaskId={dmdTask.id}
    bind:depositor
    bind:itemsToShow={dmdTask.items}
  />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import TiWarning from "svelte-icons/ti/TiWarning.svelte";
  import TiDelete from "svelte-icons/ti/TiDelete.svelte";
  import type { Depositor } from "$lib/types";
  import type { ParseRecord } from "@crkn-rcdr/access-data/dist/esm/dmd/Task";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";
  import DmdSuccessItemPreview from "$lib/components/dmd/success/DmdSuccessItemPreview.svelte";
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  /**
   *  @type { string } The 'id' of the DMDTask being shown.
   */
  export let dmdTaskId: string;

  /**
   *  @type { Depositor } The access platform the items are in.
   */
  export let depositor: Depositor;

  /**
   *  @type { ParseRecord[]  } The dmdtask items to be displayed.
   */
  export let itemsToShow: ParseRecord[] = [];

  /**
   * @type { boolean } if the json preview modal should be displayed for an item in the table.
   */
  let openPreviewModal: boolean = false;

  /**
   *  @type { number | undefined } The index of the item being previewed, in the dmd tasks item array.
   */
  let previewItemIndex: number | undefined = undefined;

  /**
   *  @type { boolean } A control for the select all items checkbox
   */
  let shouldUpdateAllItems: boolean = true;

  /**
   *  @type { string } The contents of the notification displayed for the preview, if any.
   */
  let previewNotificationMsg: string = "";

  /**
   *  @type { string } A control for the styling of the notification displayed for the preview, if any.
   */
  let previewNotificationStatus: "warn" | "fail" = "warn";

  /**
   * Handles showing the json preview modal for the item passed in
   * @param item
   * @returns void
   */
  async function handlePreviewItemPressed(index: number, item: ParseRecord) {
    openPreviewModal = true;
    previewItemIndex = index;
    if (item.message) previewNotificationMsg = item.message;
    previewNotificationStatus = item.parsed ? "warn" : "fail";
  }

  /**
   * Handles setting the selected for updating value for all items in the dmd task based on @var shouldUpdateAllItems.
   * @returns void
   */
  function toggleAllItemsSelected() {
    shouldUpdateAllItems = !shouldUpdateAllItems;
    dmdTasksStore.toggleAllItemsSelected(dmdTaskId, shouldUpdateAllItems);
  }

  /**
   * Sets @var shouldUpdateAllItems based on if all items are selected, when an item's checkbox is pressed.
   * @returns void
   */
  function checkIfAllItemsSelected(event) {
    if (event.target.checked) {
      shouldUpdateAllItems =
        dmdTasksStore.checkIfAllTaskItemsSelected(dmdTaskId);
    } else shouldUpdateAllItems = false;
  }
</script>

{#if itemsToShow.length && dmdTasksStore && $dmdTasksStore[dmdTaskId]}
  <table class="box-shadow">
    <thead>
      <tr>
        {#if $dmdTasksStore[dmdTaskId].shouldUpdateInAccess || $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
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
        <th>Metadata Validity</th>
        <th>Metadata Preview</th>
      </tr>
    </thead>
    <tbody>
      {#each itemsToShow as item, i}
        {#if typeof item === "object"}
          <tr>
            {#if $dmdTasksStore[dmdTaskId].shouldUpdateInAccess || $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
              <td>
                {#if $dmdTasksStore[dmdTaskId].itemStates[item.id].updatedInAccess === "Updating" || $dmdTasksStore[dmdTaskId].itemStates[item.id].updatedInPreservation === "Updating"}
                  <Loading size="sm" backgroundType="gradient" />
                {:else if item.parsed && !(($dmdTasksStore[dmdTaskId].shouldUpdateInAccess && $dmdTasksStore[dmdTaskId].itemStates[item.id].updatedInAccess === "Yes") || ($dmdTasksStore[dmdTaskId].shouldUpdateInPreservation && $dmdTasksStore[dmdTaskId].itemStates[item.id].updatedInPreservation === "Yes"))}
                  <input
                    type="checkbox"
                    bind:checked={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                      .shouldUpdate}
                    on:change={checkIfAllItemsSelected}
                  />
                {:else}
                  <input type="checkbox" disabled />
                {/if}
              </td>
            {/if}
            <td>
              {item.id}
            </td>
            <td>{item.label}</td>
            <td class="auto-align auto-align__a-center">
              {#if !item.parsed || item.message?.length}
                <span
                  class="icon"
                  class:not-success={!item.parsed}
                  class:warning={item.parsed && item.message?.length}
                  data-tooltip={item["message"]}
                >
                  {#if item.parsed}
                    <TiWarning />
                  {:else}
                    <TiDelete />
                  {/if}
                </span>
              {/if}
              {item.parsed && item.message?.length === 0
                ? "Valid Metadata"
                : item.parsed
                ? "Warning - Possible issues with Metadata"
                : "Invalid Metadata"}
            </td>
            <td>
              <button
                class="button ghost dark sm"
                class:danger={!item.parsed}
                class:warn={item.parsed && item.message?.length !== 0}
                on:click={() => handlePreviewItemPressed(i, item)}
                >Preview Metadata</button
              >
            </td>
          </tr>
          {#if $dmdTasksStore[dmdTaskId].itemStates[item.id].updatedInAccessMsg.length || $dmdTasksStore[dmdTaskId].itemStates[item.id].updatedInPreservationMsg.length}
            <tr class="row-details">
              <td class="result-cell" colspan="5">
                <table>
                  <tbody>
                    {#if $dmdTasksStore[dmdTaskId].itemStates[item.id].updatedInAccessMsg.length}
                      <tr
                        class:success={$dmdTasksStore[dmdTaskId].itemStates[
                          item.id
                        ].updatedInAccess === "Yes"}
                        class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                          item.id
                        ].updatedInAccess === "No"}
                      >
                        <td class="detail-label">Access Update Result:</td>
                        <td>
                          <XmlViewer
                            xml={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                              .updatedInAccessMsg}
                          />
                        </td>
                      </tr>
                    {/if}
                    {#if $dmdTasksStore[dmdTaskId].itemStates[item.id].updatedInPreservationMsg.length}
                      <tr
                        class:success={$dmdTasksStore[dmdTaskId].itemStates[
                          item.id
                        ].updatedInPreservation === "Yes"}
                        class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                          item.id
                        ].updatedInPreservation === "No"}
                      >
                        <td class="detail-label">Preservation Update Result:</td
                        >
                        <td>
                          <XmlViewer
                            xml={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                              .updatedInPreservationMsg}
                          />
                        </td>
                      </tr>
                    {/if}
                  </tbody>
                </table>
              </td>
            </tr>
          {/if}
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
  bind:previewNotificationMsg
  bind:previewNotificationStatus
/>

<style>
  .success {
    background-color: var(--success-light);
    color: var(--success);
  }
  .not-success {
    background-color: var(--danger-light);
    color: var(--danger);
  }
  .not-success.icon {
    color: var(--danger);
    background-color: transparent;
  }
  .warning {
    background-color: var(--warn-light);
  }
  .warning.icon {
    color: var(--warn);
    background-color: transparent;
  }
  .row-details table {
    margin-top: 0;
  }
  .row-details tbody {
    background: none;
  }
  .result-cell {
    padding: 0 !important;
  }
</style>
