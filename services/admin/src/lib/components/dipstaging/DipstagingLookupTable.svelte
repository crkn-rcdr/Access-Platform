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
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import type { ImportStatus, LegacyPackage } from "@crkn-rcdr/access-data";
  import Resolver from "$lib/components/access-objects/Resolver.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import ExpansionTile from "../shared/ExpansionTile.svelte";
  import { afterUpdate } from "svelte";

  /**
   * @type {ImportStatus[]}
   * The packages in the format of ImportStatus, to be displayed to the user/
   */
  export let results: (ImportStatus | LegacyPackage)[];

  export let isSlugSearch = false;

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

  let error = "";

  let items: (ImportStatus | LegacyPackage)[] = [];

  /**
   * Keeps track if @param item is selected or not
   * @param item
   * @returns void
   */
  function handleItemSelected(item: ImportStatus | LegacyPackage) {
    selectedMap[item["id"]] = !selectedMap[item["id"]];
    selectedMap = selectedMap;
  }

  /**
   * Sets all of the item's selected boolean to the value of the table's control checkbox.
   * @param event
   * @returns void
   */
  function toggleAllSelected(event) {
    for (const item of results) {
      if (!slugUnavailableMap[slugMap[item["id"]]])
        selectedMap[item["id"]] = event.target.checked;
      else selectedMap[item["id"]] = false;
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
      if (selectedMap[item["id"]]) {
        try {
          const response = await $session.lapin.mutation(
            `dipstaging.requestSmelt`,
            {
              user: $session.user,
              id: item["id"],
              slug: slugMap[item["id"]],
            }
          );
          sucessfulSmeltRequestMap[item["id"]] = true;
          selectedMap[item["id"]] = false;
          selectedMap = selectedMap;
          item["status"] = "processing";
          items = items;
        } catch (e) {
          sucessfulSmeltRequestMap[item["id"]] = false;
          error = e?.message;
        }
      }
    }
  }

  /**
   * Keeps track if @param item's slug is available or not. Is trigger on load and any time the slug is edited.
   * @param item
   * @returns void
   */
  function setSlugAvailability(event, item: ImportStatus | LegacyPackage) {
    slugUnavailableMap[slugMap[item["id"]]] = !event.detail.status;
    slugUnavailableMap = slugUnavailableMap;
    setSelectedModel();
  }

  /**
   * Sets the it's slug to its id if it's slug isn't defined
   * @returns void
   */
  function checkIfSlugsDefined() {
    if (!results) return;
    items = [];
    slugMap = {};
    for (const item of results) {
      items.push(item);
      if (!item["slug"] && !isSlugSearch) {
        item["slug"] = item["id"];
        slugMap[item["id"]] = item["id"];
      } else slugMap[item["id"]] = item["slug"];
    }
    items = items;
  }

  /**
   * Sets the selected map for items in the results array
   * @returns void
   */
  function setSelectedModel() {
    if (!items) return;
    selectedMap = {};
    for (const item of items) {
      console.log(isItemSelectable(item));
      selectedMap[item["id"]] = isItemSelectable(item);
    }
    selectedMap = selectedMap;
  }

  /**
   * Checks to see if the item can be run through smelter or not
   * @returns void
   */
  function isItemSelectable(item: ImportStatus | LegacyPackage) {
    if ("status" in item) {
      return (
        !sucessfulSmeltRequestMap[item["id"]] &&
        !slugUnavailableMap[slugMap[item["id"]]] &&
        item["status"] !== "not-found" &&
        item["status"] !== "processing"
      );
    } else {
      return (
        !sucessfulSmeltRequestMap[item["id"]] &&
        !slugUnavailableMap[slugMap[item["id"]]]
      );
    }
  }

  async function getSlugAvailability() {
    if (!items) return;
    error = "";
    const slugs: string[] = Object.values(slugMap);
    while (slugs.length > 0) {
      const slugBatch = slugs.splice(0, 500);
      //results.map((item) => item["id"]);
      try {
        const response = await $session.lapin.mutation(
          `slug.resolveMany`,
          slugBatch
        );
        for (const result of response) {
          if (result.length === 2) {
            const slug = result[0];
            const info = result[1];
            console.log(slug, info);
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
      setSelectedModel(),
    ]).then(() => {
      loading = false;
    });
  }

  $: {
    slugUnavailableMap;
    setSelectedModel();
  }
</script>

<NotificationBar message={error} status="fail" />

{#if !loading}
  <div class="button-wrap" class:disabled={!items}>
    <button
      class="primary"
      on:click={handleRunSmelterPressed}
      disabled={!(
        Object.keys(selectedMap).filter((key) => selectedMap[key]).length > 0
      )}
    >
      {isSlugSearch
        ? "Re-import Package"
        : "Import Selected Packages into Access"}
    </button>
  </div>

  <table class:disabled={!items}>
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
      {#if items}
        {#each items as item, i}
          <tr>
            <td>
              <div class="row auto-align">
                {#if !slugUnavailableMap[slugMap[item["id"]]] && !("status" in item && item.status === "processing") && !("status" in item && item.status === "not-found")}
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
            <td>
              {#if "status" in item && item.status === "not-found"}
                '{item["id"]}' was not found. {isSlugSearch
                  ? "Are you sure your manifest was derived from a preservation package?"
                  : ""}
              {:else if "status" in item && item.status === "processing"}
                This package is currently being imported. <a
                  target="_blank"
                  href="/smelter/queue"
                  >Track its status in the 'Import Queue' tab.</a
                >
              {:else}
                {#if slugUnavailableMap[slugMap[item["id"]]] && slugMap[item["id"]] === item["slug"]}
                  <NotificationBar
                    status="fail"
                    message={isSlugSearch
                      ? `The existing manifest must be deleted before the package can be re-imported into a new manifest.`
                      : `This package is already imported as a  manifest.`}
                  />

                  <p>
                    <br />
                    <a
                      href={`/object/edit/${noidMap[slugMap[item["id"]]]}`}
                      target="_blank"
                    >
                      To replace the existing import of this package, please
                      click here open it in the editor. Then, unpublish the
                      manifest if it is published. Then, press delete to delete
                      the manifest.
                    </a> When you are done, click the button below to enable importing
                    for your package.
                  </p>

                  <br />
                  <button
                    class="secondary"
                    on:click={() => {
                      slugUnavailableMap[slugMap[item["id"]]] = false;
                    }}
                  >
                    OK, I have deleted the existing manifest.
                  </button>
                {:else}
                  <span
                    >Please enter the slug you would like to use for the
                    manifest:
                  </span>
                  <Resolver
                    noid={slugMap[item["id"]] in noidMap
                      ? noidMap[slugMap[item["id"]]]
                      : null}
                    isFound={slugUnavailableMap[slugMap[item["id"]]]}
                    alwaysShowIfFound={true}
                    runInitial={true}
                    on:available={(e) => setSlugAvailability(e, item)}
                    bind:slug={slugMap[item["id"]]}
                  />
                {/if}

                <br /><br />

                <div class="import-history-wrap">
                  <ExpansionTile>
                    <span slot="top">Import History</span>
                    <div slot="bottom">
                      <!-- LEGACY PACKAGE -->
                      {#if "smelt" in item}
                        <table>
                          <tbody>
                            <tr>
                              <td class="detail-label">Import Status:</td>
                              <td>
                                {item.smelt?.["succeeded"]
                                  ? "Succeeded"
                                  : "Failed"}
                              </td>
                            </tr>
                            <tr>
                              <td class="detail-label">Request Date:</td>
                              <td>
                                {item.smelt?.requestDate
                                  ? new Date(
                                      item.smelt?.requestDate
                                    ).toLocaleString()
                                  : "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td class="detail-label">Process Date:</td>
                              <td>
                                {item.smelt?.["processDate"]
                                  ? new Date(
                                      item.smelt?.["processDate"]
                                    ).toLocaleString()
                                  : "N/A"}
                              </td>
                            </tr>
                            <tr>
                              <td class="detail-label">Message:</td>
                              <td>
                                <XmlViewer
                                  xml={item.smelt?.["message"]?.length
                                    ? item.smelt?.["message"]
                                    : "N/A"}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      {:else}
                        <!-- IMPORT STATUS -->
                        <table>
                          <tbody>
                            <tr>
                              <td class="detail-label">Import Status:</td>
                              <td
                                >{item["status"] === "succeeded"
                                  ? "Succeeded"
                                  : "Failed"}</td
                              >
                            </tr>
                            <tr>
                              <td class="detail-label">Request Date:</td>
                              <td>{item["requestDate"]}</td>
                            </tr>
                            <tr>
                              <td class="detail-label">Process Date:</td>
                              <td>{item["processDate"]}</td>
                            </tr>
                            <tr>
                              <td class="detail-label">Message:</td>
                              <td>
                                <XmlViewer
                                  xml={item["message"]?.length
                                    ? item["message"]
                                    : "N/A"}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      {/if}
                    </div>
                  </ExpansionTile>
                </div>
              {/if}
            </td>
          </tr>
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
  .import-history-wrap {
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    padding: 1rem;
  }
</style>
