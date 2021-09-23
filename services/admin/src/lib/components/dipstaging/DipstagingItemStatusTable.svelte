<script lang="ts">
  import type { ImportStatus } from "@crkn-rcdr/access-data";

  export let results: ImportStatus[];
</script>

<!--[{"status":"succeeded","id":"test","repos":["eclipse","swift","romano"],"ingestDate":"2016-03-09T18:12:05Z","noid":null,"slug":"test","requestDate":"2020-04-20T20:28:50Z","processDate":"2020-04-22T20:15:21Z","message":""}]-->

<!--on:click={toggleAllItemsSelected}
            bind:checked={shouldUpdateAllItems}-->
{#if results}
  <table>
    <thead>
      <tr>
        <th>
          <input type="checkbox" />
        </th>
        <th>Id</th>
        <th>Slug</th>
        <th>Repos</th>
        <!--th>ingestDate</th-->
        <!--th>requestDate</th>
        <th>processDate</th-->
        <th>Message</th>
      </tr>
    </thead>
    <tbody>
      {#each results as importStatus}
        <tr>
          <!--
                  bind:checked={$dmdTasksStore[dmdTaskId].itemStates[item.id]
                    .shouldUpdate}
                  on:change={checkIfAllItemsSelected}-->
          <td>
            {#if importStatus["status"] !== "slug-unavailable" && importStatus["status"] !== "processing" && importStatus["status"] !== "not-found"}
              <input type="checkbox" />
            {:else}
              <input type="checkbox" disabled />
            {/if}
          </td>
          <td>{importStatus.id}</td>
          <td>{importStatus["slug"] ? importStatus["slug"] : "none"}</td>
          <td>{@html importStatus["repos"]?.join("<br/>")}</td>
          <!--td>{importStatus["ingestDate"]}</td-->
          <!--td>{importStatus["requestDate"]}</td>
          <td>{importStatus["processDate"]}</td-->
          <td>
            {#if importStatus["status"] === "slug-unavailable"}
              Slug is taken,
              {#if importStatus["noid"]}
                <a href={`/object/${importStatus["noid"]}`} target="_blank">
                  please unassign it here before continuing.
                </a>
              {:else}
                it must be unassigned before continuing.
              {/if}
            {:else if importStatus["status"] === "processing"}
              Package already processing
            {:else if importStatus["status"] === "not-found"}
              Package not found
            {:else}
              {importStatus["status"]}
              Ready to import
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  table {
    width: 90%;
    overflow-y: auto;
  }
</style>
