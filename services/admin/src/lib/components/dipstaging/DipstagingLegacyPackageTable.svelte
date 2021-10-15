<!--
@component
### Overview
This component shows the results of a dipstaging package view. It allows the user to call smelter on eligible packages.

### Properties
|    |    |    |
| -- | -- | -- |
| results: LegacyPackage[] | required | The packages to display |
| pageNumber: number | required | The current page of results being viewed |
| view: string | required | The current view being displayed |

### Usage
```  
<DipstagingLegacyPackageTable bind:results bind:view bind:pageNumber>
  <div slot="actions"> ...optional actions</div>
</DipstagingLegacyPackageTable>
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  import FaAngleRight from "svelte-icons/fa/FaAngleRight.svelte";
  import FaAngleDown from "svelte-icons/fa/FaAngleDown.svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import type { LegacyPackage } from "@crkn-rcdr/access-data";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";

  /**
   * @type {LegacyPackage[]}
   * The packages in the format of LegacyPackage, to be displayed to the user
   */
  export let results: LegacyPackage[];

  /**
   * @type {number}
   * The current page of results being viewed
   */
  export let pageNumber: number = 1;

  /**
   * @type {string}
   * The current view being displayed
   */
  export let view: string = "updated";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {any} A map from ImportStatus.id => if the item is selected in the table
   */
  let selectedMap: any = {};

  /**
   * @type {any} A map from ImportStatus.id => if the request for adding the item to the smelte queue was sucessful or not
   */
  let sucessfulSmeltRequestMap: any = {};

  /**
   * @type {any} A map from ImportStatus.id => if the item in the table is expanded or not
   */
  let expandedMap: any = {};

  /**
   * @type {any} A map from ImportStatus.id => if the slug of the item's slug is available.
   */
  let slugAvailableMap: any = {};

  /**
   * @type {boolean}
   * An indicator if any item is selected or not. Helpful for the disabling of the smelter button.
   */
  let itemsAreSelected: boolean = true;

  /**
   * @type {boolean}
   * An indicator of if the result's item models are being processed or not
   */
  let loading = false;

  /**
   * Keeps track if @param item is selected or not
   * @param item
   * @returns void
   */
  function handleItemSelected(item: LegacyPackage) {
    selectedMap[item.id] = !selectedMap[item.id];
    selectedMap = selectedMap;
  }

  /**
   * Sets all of the item's selected boolean to the value of the table's control checkbox.
   * @param event
   * @returns void
   */
  function toggleAllSelected(event) {
    for (const item of results) {
      if (slugAvailableMap[item.id])
        selectedMap[item.id] = event.target.checked;
      else selectedMap[item.id] = false;
    }
    selectedMap = selectedMap;
  }

  /**
   * Sends a request to the back-end for each selected item in the table, to queue them up for smelter processing.
   * @returns void
   */
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
          selectedMap[item.id] = false;
        } catch (e) {
          sucessfulSmeltRequestMap[item.id] = false;
          console.log(e?.message);
        }
      }
    }
  }

  /**
   * Keeps track if @param item is expanded in the table or not
   * @param item
   * @returns void
   */
  function handleItemExpanded(item: LegacyPackage) {
    expandedMap[item.id] = !expandedMap[item.id];
    expandedMap = expandedMap;
  }

  /**
   * Keeps track if @param item's slug is available or not. Is trigger on load and any time the slug is edited.
   * @param item
   * @returns void
   */
  function setSlugAvailability(event, item: LegacyPackage) {
    slugAvailableMap[item.id] = event.detail.status;
    slugAvailableMap = slugAvailableMap;
  }

  /**
   * Sets the it's slug to its id if it's slug isn't defined
   * @returns void
   */
  function checkIfSlugsDefined() {
    for (const item of results) {
      if (!item.slug) item.slug = item.id;
    }
    results = results;
  }

  /**
   * Sets the expanded map for items in the results array
   * @returns void
   */
  function setExpandedModel() {
    for (const item of results) {
      if (!(item.id in expandedMap)) expandedMap[item.id] = false;
    }
    expandedMap = expandedMap;
  }

  /**
   * Sets the selected map for items in the results array
   * @returns void
   */
  function setSelectedModel() {
    for (const item of results) {
      if (!(item.id in selectedMap) && isItemSelectable(item))
        selectedMap[item.id] = false;
    }
    selectedMap = selectedMap;
  }

  /**
   * Checks to see if the item can be run through smelter or not
   * @returns void
   */
  function isItemSelectable(legacyPackage: LegacyPackage) {
    return (
      !sucessfulSmeltRequestMap[legacyPackage.id] &&
      slugAvailableMap[legacyPackage.id] &&
      view !== "queue"
    );
  }

  /**
   * @listens results
   * @description Calls @function checkIfSlugsDefined and @function setExpandedModel and @function setSelectedModel any time the results change. Also sets loading to re-trigger the draw of the slug resolvers
   */
  $: {
    loading = true;
    results;
    checkIfSlugsDefined();
    setExpandedModel();
    setSelectedModel();
    loading = false;
  }

  /**
   * @listens slugAvailableMap
   * @listens sucessfulSmeltRequestMap
   * @description calls @function setSelectedModel to re-set what items are selected when @var slugAvailableMap or @var sucessfulSmeltRequestMap change.
   */
  $: {
    slugAvailableMap;
    sucessfulSmeltRequestMap;
    setSelectedModel();
  }

  /**
   * @listens selectedMap
   * @description Checks the selectedMap to see if at least one item is selected, if so @var itemsAreSelected is set to true, otherwise it is false.
   */
  $: itemsAreSelected =
    Object.keys(selectedMap).filter((key) => selectedMap[key]).length > 0;
</script>

{#if !loading}
  <!--Can run smelter if a) their status is neither "not-found" or "processing" b) their slug isn't already taken by a noid.-->
  {#if typeof results !== "undefined" && typeof pageNumber !== "undefined"}
    <div class="table-actions auto-align auto-align__a-end">
      <slot name="actions" />
      {#if view !== "queue"}
        <button
          class="primary"
          on:click={handleRunSmelterPressed}
          disabled={!itemsAreSelected}
        >
          Run Smelter on Selected Packages
        </button>
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
            <th>
              {#if view === "status"}
                Processed Date
              {:else if view === "queue"}
                Request Date
              {:else}
                Updated Date
              {/if}
            </th>
            <th>Smelt Status</th>
          </tr>
        </thead>
        <tbody>
          {#each results as legacyPackage, i}
            <tr class:expanded={expandedMap[legacyPackage.id]}>
              {#if view !== "queue"}
                <td>
                  <!--slug taken logic-->
                  {#if sucessfulSmeltRequestMap[legacyPackage.id] || !slugAvailableMap[legacyPackage.id] || view === "queue"}
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
                {#if view === "status"}
                  {legacyPackage?.smelt?.processDate
                    ? new Date(
                        typeof legacyPackage.smelt.processDate === "number"
                          ? legacyPackage.smelt.processDate * 1000
                          : legacyPackage.smelt.processDate
                      ).toLocaleString()
                    : "N/A"}
                {:else if view === "queue"}
                  {legacyPackage?.smelt?.requestDate
                    ? new Date(
                        typeof legacyPackage.smelt.requestDate === "number"
                          ? legacyPackage.smelt.requestDate * 1000
                          : legacyPackage.smelt.requestDate
                      ).toLocaleString()
                    : "N/A"}
                {:else}
                  {legacyPackage?.reposManifestDate
                    ? new Date(
                        typeof legacyPackage.reposManifestDate === "number"
                          ? legacyPackage.reposManifestDate * 1000
                          : legacyPackage.reposManifestDate
                      ).toLocaleString()
                    : "N/A"}
                {/if}
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
                    {legacyPackage.smelt?.["succeeded"]
                      ? "Succeeded"
                      : "Failed"}
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
              <tr class="row-details">
                <td colspan="5">
                  <table>
                    <tbody>
                      <tr>
                        <td class="detail-label">Smelt Status:</td>
                        <td>
                          {legacyPackage.smelt?.["succeeded"]
                            ? "Succeeded"
                            : "Failed"}
                        </td>
                      </tr>
                      <tr>
                        <td class="detail-label">Request Date:</td>
                        <td>
                          {legacyPackage.smelt?.requestDate
                            ? new Date(
                                legacyPackage.smelt?.requestDate
                              ).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td class="detail-label">Process Date:</td>
                        <td>
                          {legacyPackage.smelt?.["processDate"]
                            ? new Date(
                                legacyPackage.smelt?.["processDate"]
                              ).toLocaleString()
                            : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td class="detail-label">Message:</td>
                        <td>
                          <XmlViewer
                            xml={legacyPackage.smelt?.["message"]?.length
                              ? legacyPackage.smelt?.["message"]
                              : "N/A"}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
{:else}
  <div class="loading">
    <Loading backgroundType="gradient" />
  </div>
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
  .detail-label {
    width: 20rem;
  }
  .status-text {
    flex: 9;
  }
  .loading {
    width: 100%;
    text-align: center;
  }
  .detail-label {
    width: 20rem;
  }
  .row-details {
    color: var(--secondary);
    background: var(--light-bg);
    filter: brightness(0.98);
  }
  .row-details table {
    margin-top: 0;
  }
  .row-details tbody {
    background: none;
  }
  tr.expanded {
    background: var(--light-bg);
    filter: brightness(0.98);
  }
</style>