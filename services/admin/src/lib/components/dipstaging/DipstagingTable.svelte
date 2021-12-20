<!--
@component
### Overview
This component shows the results of a dipstaging find-package(s) request or a view. It allows the user to call smelter on eligible packages.

### Properties
|    |    |    |
| -- | -- | -- |
| results: ImportStatus[] | required | The packages to display |

### Usage
```
<DipstagingItemStatusTable bind:results />
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  import FaAngleRight from "svelte-icons/fa/FaAngleRight.svelte";
  import FaAngleDown from "svelte-icons/fa/FaAngleDown.svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import type { ImportStatus, LegacyPackage } from "@crkn-rcdr/access-data";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";

  /**
   * @type {ImportStatus[]}
   * The packages in the format of ImportStatus, to be displayed to the user/
   */
  export let results: ImportStatus[] | LegacyPackage[];

  /**
   * @type {boolean}
   * An indicator of if the result's item models are being processed or not
   */
  export let loading = false;

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
  let slugUnavailableMap: any = {};

  /**
   * @type {any} A map from ImportStatus.id => if the slug of the item's slug is available.
   */
  let noidMap: any = {};

  /**
   * @type {any} A map from ImportStatus.id => if the slug of the item's slug is available.
   */
  let slugMap: any = {};

  /**
   * @type {boolean}
   * An indicator if any item is selected or not. Helpful for the disabling of the smelter button.
   */
  let itemsAreSelected: boolean = true;

  let error = "";

  /**
   * Keeps track if @param item is selected or not
   * @param item
   * @returns void
   */
  function handleItemSelected(item: ImportStatus | LegacyPackage) {
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
      if (!slugUnavailableMap[item.id])
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
    error = "";
    for (const item of results) {
      if (selectedMap[item.id]) {
        try {
          const response = await $session.lapin.mutation(
            `dipstaging.requestSmelt`,
            {
              user: $session.user,
              id: item.id,
              slug: slugMap[item["id"]],
            }
          );
          sucessfulSmeltRequestMap[item.id] = true;
          selectedMap[item.id] = false;
        } catch (e) {
          sucessfulSmeltRequestMap[item.id] = false;
          error = e?.message;
        }
      }
    }
  }

  /**
   * Keeps track if @param item is expanded in the table or not
   * @param item
   * @returns void
   */
  function handleItemExpanded(item: ImportStatus | LegacyPackage) {
    expandedMap[item.id] = !expandedMap[item.id];
    expandedMap = expandedMap;
  }

  /**
   * Keeps track if @param item's slug is available or not. Is trigger on load and any time the slug is edited.
   * @param item
   * @returns void
   */
  function setSlugAvailability(event, item: ImportStatus | LegacyPackage) {
    //slugUnavailableMap[item.id] = event.detail.status;
    slugUnavailableMap = slugUnavailableMap;
  }

  /**
   * Sets the it's slug to its id if it's slug isn't defined
   * @returns void
   */
  function checkIfSlugsDefined() {
    if (!results) return;
    for (const item of results) {
      if (!item["slug"]) {
        item["slug"] = item.id;
        slugMap[item.id] = item.id;
      } else slugMap[item.id] = item["slug"];
    }
    results = results;
  }

  /**
   * Sets the expanded map for items in the results array
   * @returns void
   */
  function setExpandedModel() {
    if (!results) return;
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
    if (!results) return;
    for (const item of results) {
      if (!(item.id in selectedMap) && isItemSelectable(item))
        selectedMap[item.id] = true;
    }
    selectedMap = selectedMap;
  }

  /**
   * Checks to see if the item can be run through smelter or not
   * @returns void
   */
  function isItemSelectable(importStatus: ImportStatus | LegacyPackage) {
    return true; /*(
      !sucessfulSmeltRequestMap[importStatus.id] &&
      slugUnavailableMap[importStatus.id] &&
      importStatus.status !== "not-found" &&
      importStatus.status !== "processing"
    );*/
  }

  async function getSlugAvailability() {
    if (!results) return;

    error = "";

    const slugs = Object.keys(slugMap);

    while (slugs.length > 0) {
      const slugBatch = slugs.splice(0, 500);
      //results.map((item) => item.id);
      try {
        const response = await $session.lapin.mutation(
          `slug.resolveMany`,
          slugBatch
        );
        for (const result of response) {
          if (result.length === 2) {
            const slug = result[0];
            const info = result[1];
            slugUnavailableMap[slug] = info.found;
            if (info.found && info.result) {
              noidMap[slug] = info.result.id;
            }
          }
        }
      } catch (e) {
        error = e?.message;
      }
    }
  }

  /**
   * @listens results
   * @description Calls @function checkIfSlugsDefined and @function setExpandedModel and @function setSelectedModel any time the results change. Also sets loading to re-trigger the draw of the slug resolvers
   */
  $: {
    loading = true;
    results;
    Promise.all([
      checkIfSlugsDefined(),
      getSlugAvailability(),
      setExpandedModel(),
      setSelectedModel(),
    ]).then(() => {
      loading = false;
    });
  }

  /**
   * @listens slugUnavailableMap
   * @listens sucessfulSmeltRequestMap
   * @description calls @function setSelectedModel to re-set what items are selected when @var slugUnavailableMap or @var sucessfulSmeltRequestMap change.
   */
  $: {
    slugUnavailableMap;
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

<NotificationBar message={error} status="fail" />

{#if !loading}
  <div class="button-wrap" class:disabled={!results}>
    <button
      class="primary"
      on:click={handleRunSmelterPressed}
      disabled={!itemsAreSelected}
    >
      Import Selected Packages into Access
    </button>
  </div>

  <table class:disabled={!results}>
    <thead>
      <tr>
        <th>
          <div class="row auto-align">
            <div class="row-check">
              <input type="checkbox" on:click={toggleAllSelected} checked />
            </div>
            <div class="row-id">AIP ID</div>
            <div class="row-status">Import Status</div>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      {#if results}
        {#each results as item, i}
          <tr>
            <td>
              <div class="row auto-align">
                {#if !slugUnavailableMap[item["id"]]}
                  <div class="row-check">
                    <input
                      type="checkbox"
                      on:click={() => handleItemSelected(item)}
                      checked={selectedMap[item["id"]]}
                    />
                  </div>
                  <div class="row-id">{item["id"]}</div>
                  <div class="row-status success">Ready to import!</div>
                {:else}
                  <div class="row-check">
                    <input type="checkbox" disabled />
                  </div>
                  <div class="row-id">{item["id"]}</div>
                  <div class="row-status fail">Unable to import.</div>
                {/if}
              </div>
            </td>
          </tr>

          <tr class="row-detail">
            {#if true}
              <td>
                {#if slugUnavailableMap[item["id"]] && slugMap[item["id"]] === item["id"]}
                  <NotificationBar
                    status="fail"
                    message={`The AIP ID for this package is already a slug for an existing manifest.`}
                  />

                  <p>
                    <br />
                    <a
                      href={`/object/edit/${noidMap[item["id"]]}`}
                      target="_blank"
                    >
                      To replace the existing import of this package, please
                      click here to unpublish and delete the package.
                    </a> When you are done, click the button below to enable importing
                    for your package.
                  </p>

                  <br />
                  <button
                    class="secondary"
                    on:click={() => {
                      slugMap[item["id"]] = "bl.test";
                      slugUnavailableMap[item["id"]] = false;
                    }}
                  >
                    OK, I have deleted the manifest.
                  </button>
                {:else}
                  <span
                    >Please enter the slug you would like to use for the
                    manifest:
                  </span>
                  <Resolver
                    noid={item["id"] in noidMap ? noidMap[item["id"]] : null}
                    bind:isFound={slugUnavailableMap[item["id"]]}
                    alwaysShowIfFound={true}
                    runInitial={true}
                    on:available={(e) => setSlugAvailability(e, item)}
                    bind:slug={slugMap[item["id"]]}
                  />
                {/if}

                <br /><br />

                Import history >
              </td>
            {:else if false}
              <td> Success status! </td>
            {:else if false}
              <td> Fail status. </td>
            {/if}
          </tr>

          <!--tr class:expanded={expandedMap[importStatus.id]}>
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
            <td class="id">
              {importStatus.id}
            </td>
            <td>
              {#if importStatus.status !== "not-found"}
                <Resolver
                  noid={importStatus["id"] in noidMap
                    ? noidMap[importStatus["id"]]
                    : null}
                  isFound={!slugUnavailableMap[importStatus["id"]]}
                  alwaysShowIfFound={true}
                  runInitial={false}
                  on:available={(e) => setSlugAvailability(e, importStatus)}
                  bind:slug={slugMap[importStatus["id"]]}
                  size="sm"
                />
              {/if}
            </td>
            <td>
              {#if importStatus.status !== "not-found"}
                {importStatus["ingestDate"]
                  ? new Date(
                      typeof importStatus["ingestDate"] === "number"
                        ? importStatus["ingestDate"] * 1000
                        : importStatus["ingestDate"]
                    ).toLocaleString()
                  : "N/A"}
              {/if}
            </td>
            <td
              class="status auto-align auto-align__block auto-align__a-center"
            >
              <span class="status-text">
                {#if sucessfulSmeltRequestMap[importStatus.id]}
                  This package is being imported into access! <a
                    target="_blank"
                    href="https://access-dev.canadiana.ca/smelter/queue"
                    ><br />Track its status in the 'Queue' tab.</a
                  >
                {:else if importStatus.status === "processing"}
                  This package is being imported into access! <a
                    target="_blank"
                    href="https://access-dev.canadiana.ca/smelter/queue"
                    ><br />Track its status in the 'Queue' tab.</a
                  >
                {:else if importStatus.status === "not-found"}
                  Package not found.
                {:else if "reposManifestDate" in importStatus && importStatus["reposManifestDate"] && "processDate" in importStatus && importStatus["processDate"] && Date.parse(importStatus["reposManifestDate"]) > Date.parse(importStatus["processDate"])}
                  This package has had recent activity.
                {:else if importStatus.status === "succeeded"}
                  This package successfully imported.
                {:else if importStatus.status === "failed"}
                  This package failed to import.
                {:else if importStatus.status === "new"}
                  This package was never imported.
                {/if}
              </span>
              {#if importStatus.status === "succeeded" || importStatus.status === "failed"}
                <span
                  class="icon"
                  on:click={() => handleItemExpanded(importStatus)}
                  data-tooltip="Information on previous import attempt..."
                >
                  {#if expandedMap[importStatus.id]}
                    <FaAngleDown />
                  {:else}
                    <FaAngleRight />
                  {/if}
                </span>
              {/if}
            </td>
          </tr>

          {#if expandedMap[importStatus.id]}
            <tr class="row-details">
              <td colspan="5">
                <table>
                  <tbody>
                    <tr>
                      <td class="detail-label">Import Status:</td>
                      <td
                        >{importStatus.status === "succeeded"
                          ? "Succeeded"
                          : "Failed"}</td
                      >
                    </tr>
                    <tr>
                      <td class="detail-label">Request Date:</td>
                      <td>{importStatus["requestDate"]}</td>
                    </tr>
                    <tr>
                      <td class="detail-label">Process Date:</td>
                      <td>{importStatus["processDate"]}</td>
                    </tr>
                    <tr>
                      <td class="detail-label">Message:</td>
                      <td>
                        <XmlViewer
                          xml={importStatus["message"]?.length
                            ? importStatus["message"]
                            : "N/A"}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          {/if}
          -->
        {/each}
      {/if}
    </tbody>
  </table>
{:else}
  <div class="loading">
    <Loading backgroundType="gradient" />
  </div>
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
  .row {
    width: 100%;
  }
  .row-check {
    margin-right: 1rem;
  }
  .row-id {
    flex: 9;
  }
  .row-detail {
    background-color: white;
  }
  .row-detail > td {
    padding: 2rem 4rem !important;
  }
  .row-status.success {
    color: var(--success);
  }
  .row-status.fail {
    color: var(--danger);
  }

  .id {
    height: 100%;
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
  table.disabled,
  .button-wrap.disabled {
    opacity: 0.2;
  }
</style>
