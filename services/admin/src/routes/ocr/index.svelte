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

  let unsubscribe;
  const interval = timer({ interval: 60000 }); // 1x per min

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  function handleImport(event) {
    const batch = event.detail;
    exportDone = exportDone.filter((el) => el.id !== batch.id);
    importWaiting.push(batch as ImportWaitingOcrBatch);
    importWaiting = importWaiting;
  }

  function handleExport(event) {
    const batch = event.detail;
    base = base.filter((el) => el.id !== batch.id);
    exportWaiting.push(batch as ExportWaitingOcrBatch);
    exportWaiting = exportWaiting;
  }

  onMount(() => {
    unsubscribe = interval.subscribe(async () => {
      let batchList = await $session.lapin.query("ocr.list");
      const results = getOcrBatches(batchList);
      ({ base, exportWaiting, exportDone, importWaiting, importDone } =
        results.props);
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
  <div class="title">
    <!--h6>OCR Batches</h6-->
    <a href="/ocr/new">
      <button class="create-button primary">Create New OCR Batch</button>
    </a>
  </div>
  <br />

  {#if base.length}
    <ExpansionTile toggled={true} topClass="toggle-title">
      <span slot="top">Awaiting Export ({base.length})</span>
      <div class="toggle-list" slot="bottom">
        {#each base as batch}
          <OcrBatchListItem
            {batch}
            stage="N/A"
            status="N/A"
            on:export={handleExport}
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
      {#if exportWaiting.length}
        <div class="ocr-card">No batches are exporting.</div>
      {:else}
        {#each exportWaiting as batch}
          <OcrBatchListItem {batch} stage="export" status={"waiting"} />
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
            stage="export"
            on:import={handleImport}
            status={batch.exportProcess["succeeded"] ? "succeeded" : "failed"}
            message={batch.exportProcess["message"]}
          />

          <!--div class="ocr-card">
            {batch.name}

            <div
              class:success={batch.exportProcess["succeeded"]}
              class:warn={batch.exportProcess["message"]?.length &&
                batch.exportProcess["succeeded"]}
              class:not-success={!batch.exportProcess["succeeded"]}
            >
              {#if batch.exportProcess["succeeded"]}
                <NotificationBar
                  message={`${batch.canvases.length} canavases successfully exported! You can now run OCR on them with Abby. Return here once completed, and press 'Import Canvases.'`}
                />
                <NotificationBar
                  message={batch.exportProcess["message"]?.length
                    ? `Warning: ${batch.exportProcess["message"]}`
                    : ""}
                  status="warn"
                />
              {:else}
                <NotificationBar
                  message={`Export failed: ${batch.exportProcess["message"]}`}
                  status="fail"
                />
              {/if}
            </div>
            <div class="button-bar">
              {#if batch.exportProcess["succeeded"]}
                <button on:click={() => requestImport(batch)} class="save">
                  Import Canvases
                </button>
              {:else}
                <button class="secondary"> Retry Export </button>
              {/if}
              <button class="danger"> Delete </button>
            </div>
          </div-->
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
          <OcrBatchListItem {batch} stage="import" status={"waiting"} />
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
            stage="import"
            status={batch.importProcess["succeeded"] ? "succeeded" : "failed"}
            message={batch.importProcess["message"]}
          />
          <!--div class="ocr-card">
            {batch.name}

            <div
              class:success={batch.importProcess["succeeded"]}
              class:warn={batch.importProcess["message"]?.length &&
                batch.importProcess["succeeded"]}
              class:not-success={!batch.importProcess["succeeded"]}
            >
              {#if batch.importProcess["succeeded"]}
                <NotificationBar
                  message={`${batch.canvases.length} canavases have been imported into access.`}
                />

                <NotificationBar
                  message={batch.importProcess["message"]?.length
                    ? `Warning: ${batch.importProcess["message"]}`
                    : ""}
                  status="warn"
                />
              {:else}
                <NotificationBar
                  message={`Import failed: ${batch.importProcess["message"]}`}
                  status="fail"
                />
              {/if}
            </div>
            <div class="button-bar">
              {#if !batch.importProcess["succeeded"]}
                <button class="secondary"> Retry Import</button>
              {/if}
              <button class="danger"> Delete </button>
            </div>
          </div-->
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
    text-align: right;
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
    /*margin-bottom: 1rem;*/
    display: grid;
    grid-gap: 1rem;
  }
  /*.button-bar {
    text-align: right;
  }*/
  /*h6 {
    flex: 9;
    margin: 0 !important;
  }*/
  .create-button {
    flex: 2;
  }

  /*.ocr-table {
    margin-top: 1rem;
  }*/
  /*.success {
    background-color: var(--success-light);
    color: var(--success);
  }*/
  .warn {
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
  }
  .export-success-wrap {
    width: 100%;
  }
  .success-status {
    width: 100%;
    flex: 9;
  }
  .row-details {
    background: white;
    filter: brightness(0.98);
  }
  .row-details table {
    margin-top: 0;
  }
  .row-details tbody {
    background: none;
  }
</style>
