<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let label = "Please provide a label for this component.";

  let query = "";
  let lookupList: string[];
  let error = "";

  async function lookupSlug() {
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

  async function selectItem() {
    if (lookupList && Object.keys(lookupList).includes(query)) {
      console.log("Print true");
      let response = await fetch(`/slug/${query}.json`, {
        credentials: "same-origin",
      });
      let slug = await response.json();
      if (response.status === 200) {
        dispatch("selected", slug);
      } else {
        error = slug.error;
      }
    }
  }
</script>

<label for="slugInput">{label}</label>
<input
  type="text"
  id="slugInput"
  list="slugList"
  bind:value={query}
  on:input={lookupSlug}
  on:change={selectItem}
/>

<datalist id="slugList">
  {#if lookupList}
    {#each Object.keys(lookupList) as item}
      <option>{item}</option>
    {/each}
  {/if}
</datalist>

{#if error}
  <p class="danger">{error}</p>
{/if}
