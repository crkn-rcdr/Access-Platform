<script lang="ts">
  import FaAngleRight from "svelte-icons/fa/FaAngleRight.svelte";
  import FaAngleDown from "svelte-icons/fa/FaAngleDown.svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import type { LegacyPackage } from "@crkn-rcdr/access-data";
  import Resolver from "../access-objects/Resolver.svelte";
  import { afterUpdate } from "svelte";

  export let results: LegacyPackage[];
  export let pageNumber: number = 1;
  export let view: string = "updated";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let loading = false;
  let selectedMap: any = {};
  let sucessfulSmeltRequestMap: any = {};
  let expandedMap: any = {};
  let slugAvailableMap: any = {};

  function handleItemSelected(item: LegacyPackage) {
    selectedMap[item.id] = !selectedMap[item.id];
    selectedMap = selectedMap;
  }

  function toggleAllSelected(event) {
    for (const item of results) {
      console.log(slugAvailableMap[item.id]);
      if (slugAvailableMap[item.id])
        selectedMap[item.id] = event.target.checked;
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
              slug: item.slug,
            }
          );
          sucessfulSmeltRequestMap[item.id] = true;
          setSelectedModel();
        } catch (e) {
          sucessfulSmeltRequestMap[item.id] = false;
          console.log(e?.message);
        }
      }
    }
  }

  function handleItemExpanded(item: LegacyPackage) {
    expandedMap[item.id] = !expandedMap[item.id];
    expandedMap = expandedMap;
  }

  function setSlugAvailability(event, item: LegacyPackage) {
    slugAvailableMap[item.id] = event.detail.status;
    slugAvailableMap = slugAvailableMap;
  }

  function checkIfSlugsDefined() {
    for (const item of results) {
      if (!item.slug) item.slug = item.id;
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

  afterUpdate(() => {
    loading = true;
    results;
    checkIfSlugsDefined();
    setExpandedModel();
    setSelectedModel();
    loading = false;
  });
</script>

{#if !loading}
  <!--Can run smelter if a) their status is neither "not-found" or "processing" b) their slug isn't already taken by a noid.-->
  {#if typeof results !== "undefined" && typeof pageNumber !== "undefined"}
    <div class="table-actions auto-align auto-align__a-end">
      <slot name="dates" />
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
            {#if view !== "queue"}
              <th>
                <input type="checkbox" on:click={toggleAllSelected} />
                <!--checked-->
              </th>
            {/if}
            <th>Id</th>
            <th>Slug</th>
            <th><!--Repos Manifest Date-->Ingest Date</th>
            <th>Smelt Status</th>
          </tr>
        </thead>
        <tbody>
          {#each results as legacyPackage, i}
            <tr>
              {#if view !== "queue"}
                <td>
                  <!--slug taken logic-->
                  {#if !slugAvailableMap[legacyPackage.id]}
                    <input
                      type="checkbox"
                      disabled
                      data-tooltip="The slug entered for this package is taken."
                    />
                  {:else}
                    <input
                      type="checkbox"
                      on:click={() => handleItemSelected(legacyPackage)}
                      checked={selectedMap[legacyPackage.id]}
                    />
                  {/if}
                </td>
              {/if}
              <!--
            class:success={legacyPackage.smelt?.["succeeded"]}
            class:not-success={!legacyPackage.smelt?.["succeeded"]}
            class:normal={!legacyPackage.smelt ||
              !("succeeded" in legacyPackage.smelt)}-->
              <td>
                {legacyPackage.id}
              </td>

              <td>
                <Resolver
                  on:available={(e) => setSlugAvailability(e, legacyPackage)}
                  bind:slug={legacyPackage.slug}
                  hideInitial={false}
                  size="sm"
                />
              </td>

              <td>
                {legacyPackage.reposManifestDate
                  ? new Date(legacyPackage.reposManifestDate).toLocaleString()
                  : "N/A"}
              </td>

              <!---->
              <td class="status auto-align align__block auto-align__a-center">
                <span class="status-text">
                  {#if sucessfulSmeltRequestMap[legacyPackage.id]}
                    Smelter is running on the package! <a
                      target="_blank"
                      href="https://access-dev.canadiana.ca/smelter/queue"
                      ><br />Track its status in the 'Queue' tab.</a
                    >
                  {:else if view === "queue"}
                    Smelter is running on the package.
                  {:else if view === "status"}
                    {legacyPackage.smelt?.["succeeded"] ? "Suceeded" : "Failed"}
                  {:else if view === "neversmelted"}
                    Never Smelted
                  {:else if view === "updated"}
                    Package requires re-smelting.
                  {/if}
                </span>

                {#if view === "status" || view === "updated"}
                  <span
                    class="icon"
                    on:click={() => handleItemExpanded(legacyPackage)}
                    data-tooltip="Information on previous smelter run..."
                  >
                    {#if expandedMap[legacyPackage.id]}
                      <FaAngleDown />
                    {:else}
                      <FaAngleRight />
                    {/if}
                  </span>
                {/if}
              </td>
            </tr>
            {#if expandedMap[legacyPackage.id]}
              <tr>
                <td colspan="5">
                  <div>
                    Smelt Status: {legacyPackage.smelt?.["succeeded"]
                      ? "Succeeded"
                      : "Failed"}
                  </div>

                  <div>
                    Message: {legacyPackage.smelt?.["message"]?.length
                      ? legacyPackage.smelt?.["message"]
                      : "N/A"}
                  </div>
                  <div>
                    Request Date: {legacyPackage.smelt?.requestDate
                      ? new Date(
                          legacyPackage.smelt?.requestDate
                        ).toLocaleString()
                      : "N/A"}
                  </div>
                  <div>
                    Process Date:
                    {legacyPackage.smelt?.["processDate"]
                      ? new Date(
                          legacyPackage.smelt?.["processDate"]
                        ).toLocaleString()
                      : "N/A"}
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
{:else}
  Loading...
{/if}

<style>
  .table-actions {
    width: 100%;
  }
  .table-actions button {
    margin-left: var(--margin-sm);
  }
  .icon {
    cursor: pointer;
  }
  td.status {
    width: 100%;
  }
  .status-text {
    flex: 9;
  }
  /*
  .success {
    background-color: var(--success-light);
  }
  .not-success {
    background-color: var(--danger-light);
  }
  .normal {
    background-color: var(--structural-div-bg);
  }
  .icon,
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
