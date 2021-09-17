<!--
@component
### Overview
This component displays the items in the dmd task throughout the various stages of completing the dmd task process in a table view.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTaskId: string | required | The id of the dmd task. |
| accessPlatform: AccessPlatform | required | The access platform the items are in. |
| itemsToShow: ParseRecord[] | optional | The dmdtask items to be displayed. |

### Usage
```
<DmdItemsTable
    dmdTaskId={dmdTask.id}
    bind:accessPlatform
    bind:itemsToShow={dmdTask.items}
  />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import TiWarning from "svelte-icons/ti/TiWarning.svelte";
  import TiDelete from "svelte-icons/ti/TiDelete.svelte";
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
        <th>Validity</th>
        <th>Preview</th>

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
                  bind:checked={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                    .shouldUpdate}
                  on:change={checkIfAllItemsSelected}
                />
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
                ? "Valid"
                : item.parsed
                ? "Warning"
                : "Invalid"}
            </td>
            <td>
              <button
                class="button ghost dark sm"
                class:danger={!item.parsed}
                class:warn={item.parsed && item.message?.length !== 0}
                on:click={() => handlePreviewItemPressed(i, item)}
                >Preview</button
              >
            </td>

            {#if $dmdTasksStore[dmdTaskId].itemStates[item.id]}
              {#if $dmdTasksStore[dmdTaskId].lookupState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
                <td
                  class:success={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                    .foundInAccess === "Yes"}
                  class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                    item.id
                  ].foundInAccess === "No"}
                >
                  {#if $dmdTasksStore[dmdTaskId].itemStates[item.id].noid}
                    <a
                      href={`/object/${
                        $dmdTasksStore[dmdTaskId].itemStates[item.id].noid
                      }`}
                      target="_blank"
                    >
                      {$dmdTasksStore[dmdTaskId].itemStates[item.id]
                        .foundInAccess}
                    </a>
                  {:else}
                    {$dmdTasksStore[dmdTaskId].itemStates[item.id]
                      .foundInAccess}
                  {/if}
                </td>
              {/if}

              {#if $dmdTasksStore[dmdTaskId].updateState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
                <td
                  class:success={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                    .updatedInAccess === "Yes"}
                  class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                    item.id
                  ].updatedInAccess === "No"}
                >
                  {$dmdTasksStore[dmdTaskId].itemStates[item.id]
                    .updatedInAccess}
                </td>
              {/if}

              {#if $dmdTasksStore[dmdTaskId].lookupState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
                <td
                  class:success={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                    .foundInPreservation === "Yes"}
                  class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                    item.id
                  ].foundInPreservation === "No"}
                >
                  {$dmdTasksStore[dmdTaskId].itemStates[item.id]
                    .foundInPreservation}
                </td>
              {/if}

              {#if $dmdTasksStore[dmdTaskId].updateState !== "ready" && $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
                <td
                  class:success={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                    .updatedInPreservation === "Yes"}
                  class:not-success={$dmdTasksStore[dmdTaskId].itemStates[
                    item.id
                  ].updatedInPreservation === "No"}
                >
                  {$dmdTasksStore[dmdTaskId].itemStates[item.id]
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
    /*color: var(--danger);*/
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
</style>
