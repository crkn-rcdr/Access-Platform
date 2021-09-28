<script lang="ts">
  import { goto } from "$app/navigation";

  import { getStores, page } from "$app/stores";
  import type { Session } from "$lib/types";

  import type { LegacyPackage } from "@crkn-rcdr/access-data";
  export let results: LegacyPackage[];
  export let pageNumber: number = 1;
  export let view: string = "updated";
  //"dip" | "neversmelted" | "queue" | "status"
  export let startDateStr: string;
  export let endDateStr: string;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  async function refineByDate() {
    goto(`/smelter/${view}/${pageNumber}/${startDateStr},${endDateStr}`);
  }
</script>

{#if typeof results !== "undefined" && typeof pageNumber !== "undefined"}
  <div class="table-actions auto-align auto-align__a-end">
    <span class="dates auto-align auto-align__a-end">
      <span class="auto-align auto-align__column">
        <label for="start">Start date:</label>
        <input
          type="date"
          id="start"
          name="trip-start"
          bind:value={startDateStr}
        />
      </span>
      <span class="auto-align auto-align__column">
        <label for="end">End date:</label>
        <input type="date" id="end" name="trip-end" bind:value={endDateStr} />
      </span>
      {#if startDateStr?.length && endDateStr?.length}
        <button class="secondary" on:click={refineByDate}
          >Refine Packages</button
        >
      {/if}
    </span>

    <button class="primary">Run Smelter on Selected Packages</button>
  </div>
  <br />
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
