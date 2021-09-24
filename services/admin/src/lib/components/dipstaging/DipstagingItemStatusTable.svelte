<script lang="ts">
  import { getStores } from "$app/stores";

  import type { Session } from "$lib/types";

  import type { ImportStatus } from "@crkn-rcdr/access-data";

  export let results: ImportStatus[];
  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();
  let selectedIndexes: number[] = [];
  let sucessfulSmeltRequestIndexes: number[] = [];

  function setSelectedIndexes() {
    selectedIndexes = [];
    let index = 0;
    for (const importStatus of results) {
      if (importStatus["status"] === "new") selectedIndexes.push(index);
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

  $: {
    results;
    setSelectedIndexes();
  }
</script>

{#if results}
  <div class="extra-spacing">
    <button class="primary" on:click={handleRunSmelterPressed}
      >Run Smelter on Selected Packages</button
    >
  </div>
  <br />
  <br />
  <br />
  <table>
    <thead>
      <tr>
        <th>
          <input type="checkbox" on:click={toggleAllSelected} checked />
        </th>
        <th>Id</th>
        <th>Repos</th>
        <!--th>ingestDate</th-->
        <!--th>requestDate</th>
        <th>processDate</th-->
        <th>Message</th>
      </tr>
    </thead>
    <tbody>
      {#each results as importStatus, i}
        <tr>
          <td>
            {#if importStatus["status"] === "new"}
              <input
                type="checkbox"
                on:click={() => handleItemSelected(i)}
                checked={selectedIndexes.includes(i)}
              />
            {:else}
              <input type="checkbox" disabled />
            {/if}
          </td>
          <td>{importStatus.id}</td>
          <td
            >{@html importStatus["repos"]
              ? importStatus["repos"].join("<br/>")
              : "N/A"}</td
          >
          <!--td>{importStatus["ingestDate"]}</td-->
          <!--td>{importStatus["requestDate"]}</td>
          <td>{importStatus["processDate"]}</td-->
          <td>
            {#if sucessfulSmeltRequestIndexes.includes(i)}
              Smelter is running on the package! <a
                target="_blank"
                href="https://access-dev.canadiana.ca/smelter/queue"
                >Track its status in the 'Queue' tab.</a
              >
            {:else if importStatus["status"] === "slug-unavailable"}
              Slug is taken,
              {#if importStatus["noid"]}
                <a href={`/object/${importStatus["noid"]}`} target="_blank">
                  please unassign it here before continuing.
                </a>
              {:else}
                it must be unassigned before continuing.
              {/if}
            {:else if importStatus["status"] === "processing"}
              Smelter is running on the package! <a
                target="_blank"
                href="https://access-dev.canadiana.ca/smelter/queue"
                >Track its status in the 'Queue' tab.</a
              >
            {:else if importStatus["status"] === "not-found"}
              Package not found.
            {:else if importStatus["status"] === "succeeded"}
              Package import has ran previously and suceeded.
            {:else if importStatus["status"] === "failed"}
              Package import has ran previously and failed.
            {:else if importStatus["status"] === "new"}
              <!--{importStatus["status"]}-->
              Ready to import!
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .extra-spacing {
    width: 95%;
  }
  button {
    float: right;
  }
  table {
    width: 95%;
    overflow-y: auto;
  }
</style>
