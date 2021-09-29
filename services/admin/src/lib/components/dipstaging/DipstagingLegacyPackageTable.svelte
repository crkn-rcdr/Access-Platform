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
  let selectedIndexes: number[] = [];
  let sucessfulSmeltRequestIndexes: number[] = [];

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  async function refineByDate() {
    goto(`/smelter/${view}/${pageNumber}/${startDateStr},${endDateStr}`);
  }

  function setSelectedIndexes() {
    selectedIndexes = [];
    let index = 0;
    for (const importStatus of results) {
      selectedIndexes.push(index); // TODO slug check logic
      index++;
    }
    selectedIndexes = selectedIndexes;
  }

  function handleItemSelected(index: number) {
    if (selectedIndexes.includes(index))
      selectedIndexes = selectedIndexes.filter((item) => item !== index);
    else {
      selectedIndexes.push(index);
      selectedIndexes = selectedIndexes;
    }
  }

  function toggleAllSelected() {
    if (selectedIndexes.length) selectedIndexes = [];
    else setSelectedIndexes();
  }

  async function handleRunSmelterPressed() {
    let index = 0;
    for (const importStatus of results) {
      if (selectedIndexes.includes(index)) {
        try {
          const response = await $session.lapin.mutation(
            `dipstaging.requestSmelt`,
            {
              user: $session.user,
              slug: importStatus.id,
            }
          );
          if (!sucessfulSmeltRequestIndexes.includes(index)) {
            sucessfulSmeltRequestIndexes.push(index);
            sucessfulSmeltRequestIndexes = sucessfulSmeltRequestIndexes;
          }
        } catch (e) {
          console.log(e?.message);
        }
      }
      index++;
    }
  }

  /*$: {
    results;
    setSelectedIndexes();
  }*/
</script>

<!--a) their status is neither "not-found" or "processing" b) their slug isn't already taken by a noid.-->
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

    {#if view !== "queue"}
      <button class="primary" on:click={handleRunSmelterPressed}
        >Run Smelter on Selected Packages</button
      >
    {/if}
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
          {#if view !== "queue"}
            <th>
              <input type="checkbox" on:click={toggleAllSelected} />
              <!--checked-->
            </th>
          {/if}
        </tr>
      </thead>
      <tbody>
        {#each results as legacyPackage, i}
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
            {#if view !== "queue"}
              <td>
                <!--slug taken logic-->
                <input
                  type="checkbox"
                  on:click={() => handleItemSelected(i)}
                  checked={selectedIndexes.includes(i)}
                />
                <!--input type="checkbox" disabled /-->
              </td>
            {/if}
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
