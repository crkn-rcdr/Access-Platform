<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  export let label = "Please provide a label for this component.";
  export let placeholder = "Placeholder...";

  let query = "";
  let lookupList: string[];
  let error = "";

  async function lookupSlug() {
    dispatch("keypress", query);

    if (query) {
      let response = await fetch(`/slug/search/${query}.json`, {
        method: "POST",
        credentials: "same-origin",
      });

      let jsonResponse = await response.json();
      if (response.status === 200) {
        lookupList = jsonResponse.data;
      } else {
        error = jsonResponse.error;
      }
    }
  }

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
