<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the object from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput, Session } from "$lib/types";
  import {
    ExportFailedOcrBatch,
    ExportSucceededOcrBatch,
    ExportWaitingOcrBatch,
    ImportFailedOcrBatch,
    ImportSucceededOcrBatch,
    ImportWaitingOcrBatch,
    OcrBatch,
  } from "@crkn-rcdr/access-data";

  function getOcrBatches(batchList) {
    const base: OcrBatch[] = [];
    const exportWaiting: ExportWaitingOcrBatch[] = [];
    const exportDone: (ExportSucceededOcrBatch | ExportFailedOcrBatch)[] = [];
    const importWaiting: ImportWaitingOcrBatch[] = [];
    const importDone: (ImportSucceededOcrBatch | ImportFailedOcrBatch)[] = [];

    for (const batch of batchList) {
      if (ImportSucceededOcrBatch.safeParse(batch).success) {
        importDone.push(batch as ImportSucceededOcrBatch);
      } else if (ImportFailedOcrBatch.safeParse(batch).success) {
        importDone.push(batch as ImportFailedOcrBatch);
      } else if (ImportWaitingOcrBatch.safeParse(batch).success) {
        importWaiting.push(batch as ImportWaitingOcrBatch);
      } else if (ExportSucceededOcrBatch.safeParse(batch).success) {
        exportDone.push(batch as ExportSucceededOcrBatch);
      } else if (ExportFailedOcrBatch.safeParse(batch).success) {
        exportDone.push(batch as ExportFailedOcrBatch);
      } else if (ExportWaitingOcrBatch.safeParse(batch).success) {
        exportWaiting.push(batch as ExportWaitingOcrBatch);
      } else {
        base.push(batch);
      }
    }

    return {
      props: {
        base,
        exportWaiting: exportWaiting.sort((a, b) => {
          if (a.exportProcess.requestDate > b.exportProcess.requestDate)
            return 1;
          else if (a.exportProcess.requestDate < b.exportProcess.requestDate)
            return -1;
          return 0;
        }),
        exportDone: exportDone.sort((a, b) => {
          if (
            "processDate" in a.exportProcess &&
            "processDate" in b.exportProcess
          ) {
            if (a.exportProcess.processDate > b.exportProcess.processDate)
              return 1;
            if (a.exportProcess.processDate < b.exportProcess.processDate)
              return -1;
          }
          return 0;
        }),
        importWaiting: importWaiting.sort((a, b) => {
          if (a.importProcess.requestDate > b.importProcess.requestDate)
            return 1;
          else if (a.importProcess.requestDate < b.importProcess.requestDate)
            return -1;
          return 0;
        }),
        importDone: importDone.sort((a, b) => {
          if (
            "processDate" in a.importProcess &&
            "processDate" in b.importProcess
          ) {
            if (a.importProcess.processDate > b.importProcess.processDate)
              return 1;
            if (a.importProcess.processDate < b.importProcess.processDate)
              return -1;
          }
          return 0;
        }),
      },
    };
  }

  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      let batchList = await context.lapin.query("ocr.list");
      return getOcrBatches(batchList);
    } catch (e) {
      return {
        props: {
          error:
            "Could not get item from the server. Please contact the platform team for assistance.",
        },
      };
    }
  };
</script>

<script lang="ts">
  import { getStores } from "$app/stores";
  import timer from "$lib/stores/timer";
  import { onDestroy, onMount } from "svelte";
  import ExpansionTile from "$lib/components/shared/ExpansionTile.svelte";
  import OcrBatchListItem from "$lib/components/ocr-batch/OcrBatchListItem.svelte";
  // Typed arrays lets us avoid checks in the front end
  export let base: OcrBatch[] = [];
  export let exportWaiting: ExportWaitingOcrBatch[] = [];
  export let exportDone: (ExportSucceededOcrBatch | ExportFailedOcrBatch)[] =
    [];
  export let importWaiting: ImportWaitingOcrBatch[] = [];
  export let importDone: (ImportSucceededOcrBatch | ImportFailedOcrBatch)[] =
    [];

  let loading = false;

  let unsubscribe;
  const interval = timer({ interval: 60000 }); // 1x per min

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  async function getBatches() {
    loading = true;
    let batchList = await $session.lapin.query("ocr.list");
    const results = getOcrBatches(batchList);
    ({ base, exportWaiting, exportDone, importWaiting, importDone } =
      results.props);
    loading = false;
  }

  onMount(() => {
    unsubscribe = interval.subscribe(async () => {
      await getBatches();
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

<div class="wrapper">
  <br />
  <br />
  <br />
  <div class="title auto-align auto-align__a-center">
    <h6>OCR Batches</h6>
    <a href="/ocr/new">
      <button class="create-button primary">Create New OCR Batch</button>
    </a>
  </div>

  {#if base.length}
    <ExpansionTile toggled={true} topClass="toggle-title">
      <span slot="top">Awaiting Export ({base.length})</span>
      <div class="toggle-list" slot="bottom">
        {#each base as batch}
          <OcrBatchListItem
            {batch}
            isListLoading={loading}
            stage="N/A"
            status="N/A"
            on:export={getBatches}
            on:delete={getBatches}
          />
        {/each}
      </div>
    </ExpansionTile>
  {/if}
  <ExpansionTile toggled={true} topClass="toggle-title">
    <span slot="top">
      Exporting ({exportWaiting.length})
    </span>
    <div class="toggle-list" slot="bottom">
      {#if !exportWaiting.length}
        <div class="ocr-card">No batches are exporting.</div>
      {:else}
        {#each exportWaiting as batch}
          <OcrBatchListItem
            {batch}
            isListLoading={loading}
            stage="export"
            status={"waiting"}
            on:cancel={getBatches}
            on:delete={getBatches}
          />
        {/each}
      {/if}
    </div>
  </ExpansionTile>
  <ExpansionTile toggled={true} topClass="toggle-title">
    <span slot="top">
      Done Exporting ({exportDone.length})
    </span>
    <div class="toggle-list" slot="bottom">
      {#if !exportDone.length}
        <div class="ocr-card">No batches are done exporting.</div>
      {:else}
        {#each exportDone as batch}
          <OcrBatchListItem
            {batch}
            isListLoading={loading}
            stage="export"
            status={batch.exportProcess["succeeded"] ? "succeeded" : "failed"}
            message={batch.exportProcess["message"]}
            on:export={getBatches}
            on:import={getBatches}
            on:delete={getBatches}
          />
        {/each}
      {/if}
    </div>
  </ExpansionTile>
  <ExpansionTile toggled={true} topClass="toggle-title">
    <span slot="top">
      Importing ({importWaiting.length})
    </span>
    <div class="toggle-list" slot="bottom">
      {#if !importWaiting.length}
        <div class="ocr-card">No batches are importing.</div>
      {:else}
        {#each importWaiting as batch}
          <OcrBatchListItem
            {batch}
            isListLoading={loading}
            stage="import"
            status={"waiting"}
            on:cancel={getBatches}
            on:delete={getBatches}
          />
        {/each}
      {/if}
    </div>
  </ExpansionTile>
  <ExpansionTile toggled={true} topClass="toggle-title">
    <span slot="top">
      Done Importing ({importDone.length})
    </span>
    <div class="toggle-list" slot="bottom">
      {#if !importDone.length}
        <div class="ocr-card">No batches are done importing.</div>
      {:else}
        {#each importDone as batch}
          <OcrBatchListItem
            {batch}
            isListLoading={loading}
            stage="import"
            status={batch.importProcess["succeeded"] ? "succeeded" : "failed"}
            message={batch.importProcess["message"]}
            on:import={getBatches}
            on:delete={getBatches}
          />
        {/each}
      {/if}
    </div>
  </ExpansionTile>
  <br />
  <br />
  <br />
</div>

<style>
  .title {
    width: 100%;
  }
  .title h6 {
    flex: 10;
  }
  :global(.toggle-title) {
    background: var(--structural-div-bg);
    padding: 1rem;
    /*font-size: var(--perfect-fourth-6);*/
    background: var(--backdrop-bg);
    margin-top: 1rem;
  }
  .ocr-card {
    width: 100%;
    background: var(--base-bg);
    background: var(--structural-div-bg);
    padding: 1rem;
    display: grid;
    grid-gap: 1rem;
  }
  .create-button {
    flex: 2;
  }
  /*.warn {
    background-color: var(--warn-light);
    color: var(--warn);
  }
  .waiting {
    color: var(--secondary);
    font-style: italic;
  }
  .not-success {
    background-color: var(--danger-light);
    color: var(--danger);
  }*/
</style>
