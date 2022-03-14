<script lang="ts">
  import { paginate } from "svelte-paginate";
  import {
    isParseSucceededDMDTask,
    isParseFailedDMDTask,
    isUpdateSucceededDMDTask,
    isUpdateFailedDMDTask,
    isUpdatingDMDTask,
    ParseSucceededDMDTask,
    UpdateSucceededDMDTask,
    UpdatingDMDTask,
    UpdateFailedDMDTask,
  } from "@crkn-rcdr/access-data";
  import Loading from "$lib/components/shared/Loading.svelte";
  import TiWarning from "svelte-icons/ti/TiWarning.svelte";
  import TiDelete from "svelte-icons/ti/TiDelete.svelte";
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";
  import DmdItemMetadataPreview from "$lib/components/dmd/DmdItemMetadataPreview.svelte";
  import type { ItemProcessRecord } from "@crkn-rcdr/access-data/dist/esm/dmd/Task";
  import Paginator from "../shared/Paginator.svelte";

  /**
   * @type { UpdateSucceededDMDTask | ParseSucceededDMDTask | UpdatingDMDTask } The dmd task being displayed
   */
  export let dmdTask:
    | UpdateSucceededDMDTask
    | ParseSucceededDMDTask
    | UpdatingDMDTask;
  export let lookupResultsMap = {};

  let state: "parsed" | "updating" | "updated" = "parsed";

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
   *  @type { string } The 'id' of the DMDTask being previewed.
   */
  let previewingDmdTaskId: string;

  function toggleAllItemsSelected() {
    shouldUpdateAllItems = !shouldUpdateAllItems;
    for (let item of dmdTask.items) {
      if (item.parsed) item.shouldStore = shouldUpdateAllItems;
    }
    dmdTask = dmdTask;
  }

  function checkIfAllItemsSelected() {
    return (
      dmdTask.items.filter((item) => item.shouldStore).length ===
      dmdTask.items.length
    );
  }

  function handlePreviewItemPressed(index: number, item: ItemProcessRecord) {
    openPreviewModal = true;
    previewingDmdTaskId = dmdTask.id;
    previewItemIndex = index;
    if (item.message) previewNotificationMsg = item.message;
    previewNotificationStatus = item.parsed ? "warn" : "fail";
  }

  function setState() {
    if (isUpdateSucceededDMDTask(dmdTask) || isUpdateFailedDMDTask(dmdTask)) {
      state = "updated";
    } else if (isUpdatingDMDTask(dmdTask)) {
      state = "updating";
    } else if (
      isParseFailedDMDTask(dmdTask) ||
      isParseSucceededDMDTask(dmdTask)
    ) {
      state = "parsed";
    }
  }

  $: {
    dmdTask;
    setState();
  }

  function setItemSelectedFromSearchResult() {
    for (const item of dmdTask.items) {
      item.shouldStore = lookupResultsMap[item.id] && item.shouldStore;
    }
    dmdTask = dmdTask;
    checkIfAllItemsSelected();
  }

  $: {
    if (lookupResultsMap && Object.keys(lookupResultsMap).length)
      setItemSelectedFromSearchResult();
  }

  let currentPage = 1;
  let pageSize = 50;
  $: paginatedItems = paginate({ items: dmdTask.items, pageSize, currentPage });
</script>

{#if dmdTask}
  <table>
    <thead>
      <tr>
        {#if state !== "updated"}
          <th>
            {#if state === "parsed"}
              <input
                type="checkbox"
                on:click={toggleAllItemsSelected}
                bind:checked={shouldUpdateAllItems}
              />
            {/if}
          </th>
        {/if}
        <th>Id</th>
        <th>Label</th>
        {#if state !== "updated"}
          <th>Metadata Validity</th>
        {/if}
        <th>Metadata Preview</th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedItems as item, i}
        <tr>
          {#if state !== "updated"}
            <td>
              {#if item.shouldStore && !("succeeded" in dmdTask.process) && !item.stored}
                <Loading size="sm" backgroundType="gradient" />
              {:else if item.parsed && lookupResultsMap[item.id]}
                <input
                  type="checkbox"
                  bind:checked={item.shouldStore}
                  on:change={checkIfAllItemsSelected}
                />
              {:else}
                <input type="checkbox" disabled />
              {/if}
            </td>
          {/if}
          <td
            class:success={item.id in lookupResultsMap &&
              lookupResultsMap[item.id]}
            class:not-success={item.id in lookupResultsMap &&
              !lookupResultsMap[item.id]}
          >
            {item.id}
          </td>
          <td>{item.label}</td>

          {#if state !== "updated"}
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
          {/if}
          <td>
            <button
              class="button ghost dark sm"
              class:danger={!item.stored && !item.parsed}
              class:warn={!item.stored &&
                item.parsed &&
                item.message?.length !== 0}
              on:click={() => handlePreviewItemPressed(i, item)}
              >Preview Metadata</button
            >
          </td>
        </tr>
        {#if "stored" in item}
          <tr class="row-details">
            <td class="result-cell" colspan="5">
              <table>
                <tbody>
                  <tr
                    class:success={item.stored}
                    class:warning={item.stored && item.message.length}
                    class:not-success={!item.stored}
                  >
                    {#if item.message.length}
                      <td class="detail-label"> Load Result:</td>
                      <td>
                        <XmlViewer xml={item.message} />
                      </td>
                    {:else}
                      <td class="detail-label"> Load Result:</td>
                      <td>
                        <XmlViewer
                          xml={`Successfully loaded metadata into ${item.destination}`}
                        />
                      </td>
                    {/if}
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
  <Paginator
    bind:page={currentPage}
    bind:pageSize
    count={dmdTask.items.length}
  />
{:else}
  No items.
{/if}

<DmdItemMetadataPreview
  dmdTaskId={previewingDmdTaskId}
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
    color: var(--warn);
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
