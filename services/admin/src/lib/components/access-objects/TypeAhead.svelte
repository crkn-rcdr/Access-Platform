<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { createEventDispatcher } from "svelte";
  import { getStores } from "$app/stores";

  /**
   * @type {string} Slug being resolved.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} Slug being resolved.
   */
  export let label = "Please provide a label for this component.";

  /**
   * @type {string} Slug being resolved.
   */
  export let placeholder = "Placeholder...";

  /**
   * @type {string} Slug being resolved.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {string} Slug being resolved.
   */
  let query = "";

  /**
   * @type {string} Slug being resolved.
   */
  let lookupList: string[];

  /**
   * @type {string} Slug being resolved.
   */
  let error = "";

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  async function lookupSlug() {
    dispatch("keypress", query);

    if (query && query.length) {
      const response = await $session.lapin.query("slug.search", query);
      if (response) {
        lookupList = response;
      } else {
        error = response.toString();
      }
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  async function selectItem(item: any) {
    dispatch("selected", item["noid"] as string);
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
    <br />
    <table>
      <thead>
        <tr>
          <th>Search Results</th>
        </tr>
      </thead>
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
