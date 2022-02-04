<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the object from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  import type { OcrBatch } from "@crkn-rcdr/access-data";

  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      const batchList = await context.lapin.query("ocr.list");

      const gert = await context.lapin.query("ocr.get", "testBaseBatch");
      console.log(gert);

      return {
        props: {
          batchList,
          error: "",
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
  // script
  export let batchList: OcrBatch[];
</script>

<br />
<br />
<div class="wrapper">
  <div class="title auto-align auto-align__a-center">
    <h6>OCR Batches</h6>
    <button class="create-button primary">Create New OCR Batch</button>
  </div>
  <br />

  {#if batchList}
    {JSON.stringify(batchList)}
  {:else}
    no
  {/if}
  <!--
    export queue<br />
    exported<br />
    import queue<br />
    imported<br />-->
  <table>
    <thead>
      <th> Name </th>
      <th> Status </th>
    </thead>
    <tbody>
      <tr>
        <td> onetwothree </td>
        <td> Success </td>
      </tr>
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
