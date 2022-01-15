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
  import { showConfirmation } from "$lib/utils/confirmation";

  /**
   * @type {string} The label for the search input.
   */
  export let label = "";

  /**
   * @type {string} The placeholder for the search input.
   */
  export let placeholder = "Placeholder...";

  /**
   * @type {string | undefined} The type of object you would like to search for.
   */
  export let type: string | undefined = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} The search term.
   */
  let query = "";

  /**
   * @type {{id: string; slug: string; type: string}} The list of slugs that contain the search term
   */
  let lookupList: { id: string; slug: string; type: string }[];

  /**
   * @type {string} An error message to be displayed.
   */
  let error = "";

  /**
   * Dispatches the @event on:keypress with the query set as the event.detail. It then sends a request to the backend to get the objects whos slug contains the query, if the query is not empty. If the request was successful, the results are stored in @var lookupList. Otherwise @var error is set and displayed to the user.
   * @returns void
   */
  async function lookupSlug() {
    dispatch("keypress", query);

    if (query && query.length) {
      try {
        const response = await $session.lapin.query("slug.search", query);
        if (response && Array.isArray(response)) {
          lookupList = type
            ? response.filter((res) => type === res["type"])
            : response;
          //console.log("lookupList", lookupList);
        } else {
          error = response.toString();
        }
      } catch (e) {
        console.log(e);
        error =
          "There was a problem with your search. Please contact the platform team for assistance.";
      }
    }
  }

  /**
   * Dispatches the @event on:selected with the noid of the selected item set as the event.detail.
   * @param item
   * @returns void
   */
  async function selectItem(item: any) {
    dispatch("selected", item["id"] as string);
  }
</script>

<label for="slugInput">{label}</label>
<div
  class="typeahead-wrap auto-align auto-align__full auto-align auto-align__column auto-align auto-align__full__j-baseline auto-align auto-align__wrap"
>
  <input
    type="text"
    id="slugInput"
    list="slugList"
    {placeholder}
    bind:value={query}
    on:input={lookupSlug}
  />

  {#if query && lookupList}
    <!--br /-->
    <table>
      <!--thead>
        <tr>
          <th>Search Results</th>
        </tr>
      </thead-->
      <tbody>
        {#each lookupList as item}
          <tr class="clickable" on:click={() => selectItem(item)}>
            <td>
              {item["slug"]}
              <span
                class="visibility-hidden float__right auto-align auto-align__full auto-align auto-align__a-center end-content"
              >
                <slot />
              </span>
            </td>
          </tr>
        {:else}
          <tr><td>No results.</td></tr>
        {/each}
      </tbody>
    </table>
  {/if}

  {#if error}
    <p class="danger">{error}</p>
  {/if}
</div>

<style>
  .typeahead-wrap {
    width: 100%;
  }
  input {
    width: 100%;
  }
  .end-content {
    max-width: 30ch;
    float: right;
  }
  tr:hover .end-content {
    visibility: visible;
  }
</style>
