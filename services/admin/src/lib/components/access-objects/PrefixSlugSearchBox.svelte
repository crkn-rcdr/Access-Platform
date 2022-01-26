<!--
@component
### Overview
The resolver component allows the user to enter a slug, and then a request is sent to the backend to vheck if an object exists with that slug. Error states are shown for invalid slugs or otherwise.

### Properties
|    |    |    |
| -- | -- | -- |
| slug : string                      | optional | Slug being resolved. |
| noid: string | null | undefined    | optional | Noid that the slug resolves to, or null. |
| hideInitial : boolean              | optional | Whether to hide the display when the current slug is the same as the initial slug provided. |

### Usage
```  
  <Resolver
    bind:slug={object["slug"]}
    noid={object["id"]}
    on:available={(event) => {
      ..do something
    }}
  />
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import Loading from "../shared/Loading.svelte";

  export let label: string = "slugs";

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  let prefix = {
    prefix: "none",
    label: "",
  };
  let input = "";

  let loading = false;
  /**
   * @returns void
   */
  async function handleSlugsChange() {
    loading = true;

    // Split the slug textbox input by space or commas
    let slugs = input.split(/[,|\s]/);

    // Strip any weird characters (to handle copy pasting from documents)
    // And do not take empty lines
    slugs = slugs
      .map((slug) => slug.trim().replace(/[^\x00-\x7F]/g, ""))
      .filter((slug) => slug.length);

    // Add the prefix if one is selected
    if (prefix && prefix.prefix !== "none") {
      slugs = slugs.map((slug) => `${prefix.prefix}.${slug}`);
    }

    // Strip duplicates from the array
    slugs = [...new Set(slugs)];

    // Send array to parent
    dispatch("slugs", slugs);
    loading = false;
  }

  $: {
    input;
    handleSlugsChange();
  }

  $: {
    prefix;
    handleSlugsChange();
  }
</script>

<div>
  <PrefixSelector bind:depositor={prefix} /><br />
  <textarea
    rows="4"
    placeholder={`Enter a list of ${label} seperated by commas or new lines.`}
    bind:value={input}
  />
  <br />
  {#if loading}
    <span class="loader">
      <Loading size="sm" backgroundType="gradient" /> Please wait, sanitizing list...
    </span>
  {/if}
</div>

<style>
  textarea {
    width: 100%;
    height: 100%;
  }
</style>
