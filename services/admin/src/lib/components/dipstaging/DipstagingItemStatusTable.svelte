<script lang="ts">
  import FaAngleRight from "svelte-icons/fa/FaAngleRight.svelte";
  import FaAngleDown from "svelte-icons/fa/FaAngleDown.svelte";
  import { getStores } from "$app/stores";

  import type { Session } from "$lib/types";

  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import { isArray } from "lodash-es";
  import Resolver from "../access-objects/Resolver.svelte";

  export let results: ImportStatus[];
  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  /*const { session } = getStores<Session>();
  let selectedIndexes: number[] = [];
  let sucessfulSmeltRequestIndexes: number[] = [];

  function setSelectedIndexes() {
    selectedIndexes = [];
    let index = 0;
    for (const importStatus of results) {
      if (importStatus.status !== "not-found") selectedIndexes.push(index);
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
              id: importStatus.id,
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
  }*/

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let selectedMap: any = {};
  let sucessfulSmeltRequestMap: any = {};
  let expandedMap: any = {};
  let slugUnavailableMap: any = {};

  function handleItemSelected(item: ImportStatus) {
    selectedMap[item.id] = !selectedMap[item.id];
    selectedMap = selectedMap;
  }

  function toggleAllSelected() {
    for (const item of results) {
      if (!slugUnavailableMap[item.id])
        selectedMap[item.id] = !selectedMap[item.id];
      else selectedMap[item.id] = false;
    }
    selectedMap = selectedMap;
  }

  async function handleRunSmelterPressed() {
    for (const item of results) {
      if (selectedMap[item.id]) {
        try {
          const response = await $session.lapin.mutation(
            `dipstaging.requestSmelt`,
            {
              user: $session.user,
              id: item.id,
              slug: item["slug"],
            }
          );
          console.log(response);
          sucessfulSmeltRequestMap[item.id] = true;
          setSelectedModel();
        } catch (e) {
          sucessfulSmeltRequestMap[item.id] = false;
          console.log(e?.message);
        }
      }
    }
  }

  function handleItemExpanded(item: ImportStatus) {
    expandedMap[item.id] = !expandedMap[item.id];
    expandedMap = expandedMap;
  }

  function setSlugAvailability(event, item: ImportStatus) {
    slugUnavailableMap[item.id] = event.detail.status;
    console.log(slugUnavailableMap);
    slugUnavailableMap = slugUnavailableMap;
  }

  function checkIfSlugsDefined() {
    for (const item of results) {
      if (!item["slug"]) item["slug"] = item.id;
    }
    results = results;
  }

  function setExpandedModel() {
    for (const item of results) {
      if (!(item.id in expandedMap)) expandedMap[item.id] = false;
    }
    expandedMap = expandedMap;
  }

  function setSelectedModel() {
    for (const item of results) {
      if (!(item.id in selectedMap)) selectedMap[item.id] = false;
    }
    selectedMap = selectedMap;
  }

  $: {
    results;
    checkIfSlugsDefined();
    setExpandedModel();
    setSelectedModel();
  }
</script>

<br />
<br />
<br />
<br />
{#if results && results.length}
  <div class="button-wrap">
    <button class="primary" on:click={handleRunSmelterPressed}>
      Run Smelter on Selected Packages
    </button>
  </div>

  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Slug</th>
        <th>Ingest Date</th>
        <th>Status</th>
        <th>
          <input type="checkbox" on:click={toggleAllSelected} checked />
        </th>
      </tr>
    </thead>
    <tbody>
      {#each results as importStatus, i}
        <tr>
          <td class="id auto-align auto-align__a-center">
            {#if importStatus.status === "succeeded" || importStatus.status === "failed"}
              <span
                class="icon"
                on:click={() => handleItemExpanded(importStatus)}
              >
                {#if expandedMap[importStatus.id]}
                  <FaAngleDown />
                {:else}
                  <FaAngleRight />
                {/if}
              </span>
            {/if}
            {importStatus.id}
          </td>
          <td>
            {#if importStatus.status !== "not-found"}
              <Resolver
                on:available={(e) => setSlugAvailability(e, importStatus)}
                bind:slug={importStatus["slug"]}
                hideInitial={false}
                size="sm"
              />
            {/if}
          </td>
          <!--td
            >{@html importStatus["repos"]
              ? importStatus["repos"].join("<br/>")
              : "N/A"}</td
          -->
          <td>
            {#if importStatus.status !== "not-found"}
              {importStatus["ingestDate"]}
            {/if}
          </td>
          <td>
            {#if sucessfulSmeltRequestMap[importStatus.id]}
              Smelter is running on the package! <a
                target="_blank"
                href="https://access-dev.canadiana.ca/smelter/queue"
                ><br />Track its status in the 'Queue' tab.</a
              >
            {:else if importStatus.status === "processing"}
              Smelter is running on the package! <a
                target="_blank"
                href="https://access-dev.canadiana.ca/smelter/queue"
                ><br />Track its status in the 'Queue' tab.</a
              >
            {:else if importStatus.status === "not-found"}
              Package not found.
            {:else if importStatus.status === "succeeded"}
              Succeeded
            {:else if importStatus.status === "failed"}
              Failed
            {:else if importStatus.status === "new"}
              <!--{importStatus.status}-->
              Ready to import!
            {/if}
          </td>
          <td>
            {#if sucessfulSmeltRequestMap[importStatus.id] || !slugUnavailableMap[importStatus.id] || importStatus.status === "not-found" || importStatus.status === "processing"}
              <input type="checkbox" disabled />
            {:else}
              <input
                type="checkbox"
                on:click={() => handleItemSelected(importStatus)}
                checked={selectedMap[importStatus.id]}
              />
            {/if}
          </td>
        </tr>

        {#if (expandedMap[importStatus.id] && importStatus.status === "succeeded") || importStatus.status === "failed"}
          <tr>
            <td colspan="5">
              <div>
                Status: {importStatus.status === "succeeded"
                  ? "Succeeded"
                  : "Failed"}
              </div>
              <div>Request Date: {importStatus["requestDate"]}</div>
              <div>Process Date: {importStatus["processDate"]}</div>
              <div>
                Message: {importStatus.message?.length
                  ? importStatus.message
                  : "N/A"}
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .button-wrap {
    text-align: right;
  }
  table {
    margin-top: 2rem;
    width: 100%;
    overflow-y: auto;
  }
  .id {
    height: 100%;
  }
  .icon {
    cursor: pointer;
  }
</style>
