<script lang="ts">
  import type { LegacyPackage } from "@crkn-rcdr/access-data";
  export let results: LegacyPackage[];
  export let pageNumber: number = 1;
  export let view: "dip" | "neversmelted" | "queue" | "status" = "dip";
  let startDateStr: string;
  let endDateStr: string;
</script>

{#if typeof results !== "undefined" && typeof pageNumber !== "undefined"}
  <div class="table-actions auto-align">
    <span class="dates">
      <span>
        <label for="start">Start date:</label>
        <input
          type="date"
          id="start"
          name="trip-start"
          bind:value={startDateStr}
        />
      </span>
      <span>
        <label for="end">End date:</label>
        <input
          type="date"
          id="end"
          name="trip-end"
          bind:value={endDateStr}
        /><br />
      </span>
    </span>

    <button class="primary">Run Smelter on Selected Packages</button>
  </div>
  <br />
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Slug</th>
          <th>Smelt Status</th>
          <th>Message</th>
          <th>Repos Manifest Date</th>
          <th>Request Date</th>
          <th>Process Date</th>
          <th><input type="checkbox" /></th>
        </tr>
      </thead>
      <tbody>
        {#each results as legacyPackage}
          <tr>
            <td>
              {legacyPackage.id}
            </td>
            <td>
              {legacyPackage.slug}
            </td>
            {#if legacyPackage.smelt}
              <td>
                {legacyPackage.smelt?.["succeeded"] ? "Suceeded" : "Failed"}
              </td>
            {:else}
              <td> N/A </td>
            {/if}

            <td>
              {legacyPackage.smelt?.["message"]?.length
                ? legacyPackage.smelt?.["message"]
                : "N/A"}
            </td>
            <td>
              {legacyPackage.reposManifestDate
                ? new Date(legacyPackage.reposManifestDate).toLocaleString()
                : "N/A"}
            </td>

            <td>
              {legacyPackage.smelt?.requestDate
                ? new Date(legacyPackage.smelt?.requestDate).toLocaleString()
                : "N/A"}
            </td>

            <td>
              {legacyPackage.smelt?.["processDate"]
                ? new Date(
                    legacyPackage.smelt?.["processDate"]
                  ).toLocaleString()
                : "N/A"}
            </td>
            <td><input type="checkbox" /></td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .table-actions {
    width: 100%;
  }
  .dates {
    flex: 9;
  }
  .dates > span:not(:first-child) {
    margin-left: var(--margin-sm);
  }
  .table-actions button {
    margin-left: var(--margin-sm);
  }

  /*.icon,
  .icon svg {
    cursor: pointer;
  }
  .icon {
    color: var(--secondary);
  }
  .icon:hover {
    background: none !important;
  }

  .icon.sort {
    width: 1.3rem;
    height: 1.4rem;
    margin-top: -0.12rem;
  }
  .icon.filter {
    width: 1rem;
    height: 1.7rem;
  }*/

  /*th:not(:first-child) {
    border-left: 1px solid var(--border-color);
  }*/
</style>
