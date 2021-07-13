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
        lookupList = jsonResponse.noid;
      } else {
        error = jsonResponse.error;
      }
    }
  }

  async function selectItem(slug: string) {
    if (
      lookupList &&
      Object.keys(lookupList).filter((item) => item.includes(query)).length
    ) {
      let response = await fetch(`/slug/resolve/${slug}.json`, {
        credentials: "same-origin",
      });
      let data = await response.json();
      if (response.status === 200) {
        dispatch("selected", data.noid as string);
      } else {
        error = data.error;
      }
    }
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
  <!--TODO: figure out how to format-->
  <!--datalist id="slugList">
    {#if lookupList}
      {#each Object.keys(lookupList) as item}
        <option>{item}</option>
      {/each}
    {/if}
  </datalist-->
  {#if query && lookupList}
    <br />
    <table>
      <thead>
        <tr>
          <th>Search Results</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.keys(lookupList) as item}
          <tr class="clickable" on:click={() => selectItem(item)}>
            <td>
              {item}
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
