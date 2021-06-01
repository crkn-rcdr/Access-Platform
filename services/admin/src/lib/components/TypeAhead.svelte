<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let label = "Please provide a label for this component.";

  let prefix = "";
  let lookupList = [];
  let error = "";

  async function lookupSlug() {
    if (prefix) {
      let response = await fetch(`/slug/search/${prefix}.json`, {
        method: "POST",
        credentials: "same-origin",
      });
      console.log("lookup response", response);
      let json = await response.json();
      if (response.status === 200) {
        lookupList = json;
        console.log("what in lookup", lookupList);
      } else {
        error = json.error;
      }
    }
  }

  async function selectItem(event) {
    console.log("***lookuplist***", lookupList);
    if (lookupList && lookupList.includes(prefix)) {
      let response = await fetch(`/slug/${prefix}.json`, {
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
  bind:value={prefix}
  on:input={lookupSlug}
  on:change={selectItem}
/>

<datalist id="slugList">
  {#if lookupList}
    {#each lookupList as item}
      <option>{item}</option>
    {/each}
  {/if}
</datalist>

{#if error}
  <p class="danger">{error}</p>
{/if}
