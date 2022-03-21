<script lang="ts">
  import type { DMDTask, ShortTaskType } from "@crkn-rcdr/access-data";
  import Loading from "$lib/components/shared/Loading.svelte";
  import TiWarning from "svelte-icons/ti/TiWarning.svelte";
  import TiDelete from "svelte-icons/ti/TiDelete.svelte";
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";
  import DmdItemMetadataPreview from "$lib/components/dmd/DmdItemMetadataPreview.svelte";
  import type { ItemProcessRecord } from "@crkn-rcdr/access-data/dist/esm/dmd/Task";
  import Paginator from "../shared/Paginator.svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import DmdItemSelector from "./DmdItemSelector.svelte";
  import { afterUpdate } from "svelte";

  /**
   * @type { DMDTask } The dmd task being displayed
   */
  export let dmdTask: DMDTask;
  export let type: ShortTaskType;
  export let totalItems: number = 0;
  export let totalPages: number = 0;
  export let currentPage = 1;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let state: "parsed" | "updating" | "updated" | "paused" = "parsed";

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
    for (let item of dmdTask["items"]) {
      if (item.parsed) item.shouldStore = shouldUpdateAllItems;
    }
    dmdTask = dmdTask;
  }

  function checkIfAllItemsSelected() {
    // todo backend
    return (
      dmdTask["items"].filter((item) => item.shouldStore).length ===
      dmdTask["items"].length
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
    if (type === "store paused") {
      state = "paused";
    } else if (type === "store failed" || type === "store succeeded") {
      state = "updated";
    } else if (type === "storing" || type === "store queued") {
      state = "updating";
    } else if (type === "parse failed" || type === "parse succeeded") {
      state = "parsed";
    }
  }

  $: {
    dmdTask;
    setState();
    checkIfAllItemsSelected();
  }

  let pageSize = 100;

  async function handlePageChange(event: any) {
    currentPage = event.detail.page;
    try {
      const pageData = await $session.lapin.query("dmdTask.page", {
        id: dmdTask.id,
        page: currentPage,
        limit: 100,
      });
      if (pageData && pageData.list) dmdTask["items"] = pageData.list;
    } catch (e) {
      console.log(e);
    }
  }
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
      {#each dmdTask["items"] as item, i}
        <tr>
          {#if state !== "updated"}
            <td>
              {#if item.shouldStore && !("succeeded" in dmdTask["process"]) && !item.stored}
                <Loading size="sm" backgroundType="gradient" />
              {:else if item.parsed && item.found}
                <DmdItemSelector
                  taskId={dmdTask.id}
                  index={i + (currentPage - 1) * pageSize}
                  checked={item.shouldStore}
                  on:changed={checkIfAllItemsSelected}
                />
              {:else}
                <input type="checkbox" disabled />
              {/if}
            </td>
          {/if}
          <td
            class:success={item.found}
            class:not-success={"found" in item && !item.found}
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
    pageSizeEditable={false}
    count={totalItems}
    on:change={handlePageChange}
  />
  <br />
  <br />
  <br />
  <br />
  <br />
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
