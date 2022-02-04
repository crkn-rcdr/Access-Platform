<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the object from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  import {
    ExportFailedOcrBatch,
    ExportSucceededOcrBatch,
    ExportWaitingOcrBatch,
    ImportFailedOcrBatch,
    ImportSucceededOcrBatch,
    ImportWaitingOcrBatch,
    OcrBatch,
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
  // Typed arrays lets us avoid checks in the front end
  export let base: OcrBatch[] = [];
  export let exportWaiting: ExportWaitingOcrBatch[] = [];
  export let exportDone: (ExportSucceededOcrBatch | ExportFailedOcrBatch)[] =
    [];
  export let importWaiting: ImportWaitingOcrBatch[] = [];
  export let importDone: (ImportSucceededOcrBatch | ImportFailedOcrBatch)[] =
    [];
</script>

<br />
<br />
<div class="wrapper">
  <div class="title auto-align auto-align__a-center">
    <h6>OCR Batches</h6>
    <button class="create-button primary">Create New OCR Batch</button>
  </div>
  <br />
  <table>
    <thead>
      <th> Name </th>
      <th> # Canvases </th>
      <th> Status </th>
    </thead>
    <tbody>
      {#each base as batch}
        <tr>
          <td> {batch.name} </td>
          <td> {batch.canvases.length} </td>
          <td> N/A </td>
        </tr>
      {/each}

      {#each exportWaiting as batch}
        <tr>
          <td> {batch.name} </td>
          <td> {batch.canvases.length} </td>
          <td> exporting... </td>
        </tr>
      {/each}

      {#each exportDone as batch}
        <tr>
          <td> {batch.name} </td>
          <td> {batch.canvases.length} </td>
          <td> button if success or if fail </td>
        </tr>
      {/each}

      {#each importWaiting as batch}
        <tr>
          <td> {batch.name} </td>
          <td> {batch.canvases.length} </td>
          <td> importing... </td>
        </tr>
      {/each}

      {#each importDone as batch}
        <tr>
          <td> {batch.name} </td>
          <td> {batch.canvases.length} </td>
          <td> success or not </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .title {
    width: 100%;
  }
  h6 {
    flex: 9;
    margin: 0 !important;
  }
  .create-button {
    flex: 2;
  }
</style>
