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
    Slug,
  } from "@crkn-rcdr/access-data";

  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      let batchList = await context.lapin.query("ocr.list");

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
  import { showConfirmation } from "$lib/utils/confirmation";
  // Typed arrays lets us avoid checks in the front end
  export let base: OcrBatch[] = [];
  export let exportWaiting: ExportWaitingOcrBatch[] = [];
  export let exportDone: (ExportSucceededOcrBatch | ExportFailedOcrBatch)[] =
    [];
  export let importWaiting: ImportWaitingOcrBatch[] = [];
  export let importDone: (ImportSucceededOcrBatch | ImportFailedOcrBatch)[] =
    [];

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  async function requestImport(batch: OcrBatch) {
    await showConfirmation(
      async () => {
        try {
          const response = await $session.lapin.mutation(`ocr.requestImport`, {
            user: $session.user,
            id: batch.id,
          });
          if (response) {
            batch = response;
            exportDone = exportDone.filter((el) => el.id !== batch.id);
            importWaiting.push(batch as ImportWaitingOcrBatch);
            importWaiting = importWaiting;
          }
          return {
            success: true,
            details: "",
          };
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "Success: batch queued for importing.",
      "Error: failed queue batch for importing."
    );
  }
</script>

<br />
<br />
<div class="wrapper">
  <div class="title">
    <!--h6>OCR Batches</h6-->
    <a href="/ocr/new">
      <button class="create-button primary">Create New OCR Batch</button>
    </a>
  </div>
  <table class="ocr-table">
    <thead>
      <th> OCR Batches </th>
      <!--th> Updated By </th>
      <th> # Canvases </th-->
    </thead>
    <tbody>
      <!--{#each base as batch}
        <tr>
          <td> {batch.name} </td>
          <td> {batch.staff.by.name} </td>
          <td> {batch.canvases.length} </td>
        </tr>
      {/each}-->

      {#each exportWaiting as batch}
        <tr>
          <td> {batch.name} </td>
          <!--td> {batch.staff.by.name} </td>
          <td> {batch.canvases.length} </td-->
        </tr>
        <tr class="row-details waiting">
          <td> Exporting {batch.canvases.length} canvases... </td>
        </tr>
      {/each}

      {#each exportDone as batch}
        <tr>
          <td> {batch.name} </td>
          <!--td> {batch.staff.by.name} </td>
          <td> {batch.canvases.length} </td-->
        </tr>
        <tr class="row-details">
          <td class="result-cell">
            <table>
              <tbody>
                <tr
                  class:success={batch.exportProcess["succeeded"]}
                  class:warn={batch.exportProcess["message"]?.length &&
                    batch.exportProcess["succeeded"]}
                  class:not-success={!batch.exportProcess["succeeded"]}
                >
                  {#if batch.exportProcess["succeeded"]}
                    <td colspan="3">
                      <span
                        class="export-success-wrap auto-align auto-align__a-center"
                      >
                        <span class="success-status">
                          {batch.canvases.length} canavases successfully exported!
                        </span>
                        <button
                          on:click={() => requestImport(batch)}
                          class="import-button save"
                        >
                          Import Canvases
                        </button>
                      </span>
                      <br />
                      {batch.exportProcess["message"]}
                    </td>
                  {:else}
                    <td colspan="3">
                      Export failed: {batch.exportProcess["message"]}
                    </td>
                  {/if}
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      {/each}

      {#each importWaiting as batch}
        <tr>
          <td> {batch.name} </td>
          <!--td> {batch.staff.by.name} </td>
          <td> {batch.canvases.length} </td-->
        </tr>
        <tr class="row-details waiting">
          <td> Importing {batch.canvases.length} canvases... </td>
        </tr>
      {/each}

      {#each importDone as batch}
        <tr>
          <td> {batch.name} </td>
          <!--td> {batch.staff.by.name} </td>
          <td> {batch.canvases.length} </td-->
        </tr>
        <tr class="row-details">
          <td class="result-cell">
            <table>
              <tbody>
                <tr
                  class:success={batch.importProcess["succeeded"]}
                  class:warn={batch.importProcess["message"]?.length &&
                    batch.importProcess["succeeded"]}
                  class:not-success={!batch.importProcess["succeeded"]}
                >
                  <td>
                    {#if batch.importProcess["succeeded"]}
                      {batch.canvases.length} canavases have been imported into access.
                      <br />
                      {batch.importProcess["message"]}
                    {:else}
                      Import failed: {batch.importProcess["message"]}
                    {/if}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<br />
<br />
<br />

<style>
  .title {
    width: 100%;
    text-align: right;
  }
  /*h6 {
    flex: 9;
    margin: 0 !important;
  }*/
  .create-button {
    flex: 2;
  }

  .ocr-table {
    margin-top: 1rem;
  }
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
