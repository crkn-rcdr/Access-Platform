<!--
@component
### Overview
This componenet allows the user to search the backend for any access object that has a slug that contains the search term. It lists matching objects in a table.

### Properties
|    |    |    |
| -- | -- | -- |
| label : string       | optional | The label for the search input. |
| placeholder : string | optional | The placeholder for the search input. |
| type : string | undefined | optional | he type of object you would like to search for. |

### Usage
```  
<TypeAhead label="Label:" placeholder="placeholder" on:selected={(event) -> { console.log(event.detail) }} />
```
*Note: the noid of the selected item is returned from `on:selected`*
-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { createEventDispatcher } from "svelte";
  import { getStores } from "$app/stores";
  import PrefixSlugSearchBox from "../access-objects/PrefixSlugSearchBox.svelte";
  import type { Noid, Slug } from "@crkn-rcdr/access-data";
  import Loading from "../shared/Loading.svelte";

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} An error message to be displayed.
   */
  let error = "";

  /**
   * @type {NodeJS.Timeout | null} Used to debounce the searching of slugs.
   */
  let timer: NodeJS.Timeout | null = null;

  let searchedSlugs: Slug[] = [];
  let foundSlugs: Slug[];
  let manifestSlugIdMap: any;
  let selectedManifestNoids: Noid[] = [];
  let loading: boolean = false;

  /**
   * Dispatches the @event on:keypress with the query set as the event.detail. It then sends a request to the backend to get the objects whos slug contains the query, if the query is not empty. If the request was successful, the results are stored in @var lookupList. Otherwise @var error is set and displayed to the user.
   * @returns void
   */
  async function handleSearchPressed() {
    if (!searchedSlugs.length) return;
    if (timer) clearTimeout(timer);
    loading = true;
    timer = setTimeout(async () => {
      try {
        manifestSlugIdMap = {};
        const response = await $session.lapin.mutation(`manifest.search`, {
          slugs: searchedSlugs,
          fields: ["id", "label", "canvases"],
        });
        for (const result of response) {
          if (result.length === 2) {
            const slug = result[0];
            const info = result[1];
            if (info.found && info.result) {
              manifestSlugIdMap[slug] = info.result;
            }
          }
        }
        manifestSlugIdMap = manifestSlugIdMap;
        loading = false;
      } catch (e) {
        console.log(e);
      }
    }, 5000);
  }

  async function handleSlugListChange(event) {
    searchedSlugs = event.detail;
    await handleSearchPressed();
  }

  function handleItemSelected(manifest: any) {
    if (selectedManifestNoids.includes(manifest.id))
      selectedManifestNoids = selectedManifestNoids.filter(
        (item) => item === manifest.id
      );
    else selectedManifestNoids.push(manifest.id);
    selectedManifestNoids = selectedManifestNoids;
  }

  $: {
    foundSlugs = manifestSlugIdMap ? Object.keys(manifestSlugIdMap) : [];
  }
</script>

<div class="auto-align auto-align__full">
  <div>
    <PrefixSlugSearchBox rows={12} on:slugs={handleSlugListChange} />
    <!--button class="search primary" on:click={handleSearchPressed}>Search</button
    -->
  </div>

  {#if loading}
    <div class="loader">
      <Loading backgroundType="gradient" />
    </div>
  {:else if foundSlugs?.length}
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th> <input type="checkbox" /> </th>
            <th> Slug </th>
            <th> Label </th>
            <th class="canvases-row"> # Canvases </th>
          </tr>
        </thead>
        <tbody>
          {#each foundSlugs as slug}
            {#if !(slug in manifestSlugIdMap)}
              <tr>
                <td>
                  <input type="checkbox" disabled />
                </td>
                <td colspan="3">
                  {slug}
                </td>
              </tr>
              <tr class="not-success">
                <td colspan="4">Not found</td>
              </tr>
            {:else if !manifestSlugIdMap[slug]["canvases"]?.length}
              <tr>
                <td>
                  <input type="checkbox" disabled />
                </td>
                <td colspan="3">
                  {slug}
                </td>
              </tr>
              <tr class="not-success">
                <td colspan="4">Not canvases to add</td>
              </tr>
            {:else}
              <tr class="clickable">
                <td>
                  <input
                    type="checkbox"
                    on:click={() => handleItemSelected(manifestSlugIdMap[slug])}
                  />
                </td>
                <td>
                  {slug}
                </td>
                <td>
                  {manifestSlugIdMap[slug]["label"]?.["none"]}
                </td>
                <td>
                  {manifestSlugIdMap[slug]["canvases"]?.length}
                </td>
              </tr>
            {/if}
          {:else}
            <tr><td>No results.</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

{#if error}
  <p class="danger">{error}</p>
{/if}

<style>
  .table-wrap {
    max-height: 43vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
  table {
    margin-left: 1rem;
    position: relative;
  }
  th {
    position: sticky;
    top: 0;
    background: var(--backdrop-bg);
    z-index: 1;
  }
  .not-success {
    background-color: var(--danger-light);
    color: var(--danger);
  }
  .loader {
    width: 100%;
    text-align: center;
  }
  .canvases-row {
    min-width: 9rem;
  }
</style>
