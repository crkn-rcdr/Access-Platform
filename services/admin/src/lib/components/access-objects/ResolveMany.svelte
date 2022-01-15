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
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";

  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";

  let depositor = {
    prefix: "none",
    label: "",
  };

  let input = "";
  let error: string;

  /**
   * @type {boolean}
  /**
   * Whether to hide the display when the current slug is the
   * same as the initial slug provided.
   */
  let hideInitial = false;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Searches the backend for an object by the inputted slug. It also shows various error states to the user.
   * @returns void
   */

  async function slugSelector() {
    error = "";
    let slugs = input.split(/[,|\s]/);
    if (depositor?.prefix !== "none") {
      slugs = slugs.map((slug) => depositor?.prefix + slug);
    }

    try {
      const response = await $session.lapin.mutation("slug.resolveMany", slugs);
      //console.log("response", response);

      dispatch("found", response);
    } catch (e) {
      console.log(e);
      error =
        "There was a problem with your search. Please contact the platform team for assistance.";
    }
    hideInitial = true;
  }

  function clear() {
    input = "";
    depositor = {
      prefix: "none",
      label: "",
    };
  }
</script>

<div>
  <NotificationBar status="fail" message={error} />
  {#if !hideInitial}
    <PrefixSelector bind:depositor /><br /><br />

    <div class="grid">
      <textarea bind:value={input} />
    </div>
    <br />
    <button class="primary lg" on:click={clear}>Clear</button>
    <button class="primary lg" on:click={slugSelector}>Lookup</button> <br />
  {/if}
</div>

<style>
  textarea {
    display: grid;
    background-color: var(--primary-light);
    width: 100%;
    height: 100%;
    grid-column: 1/2;
  }
  .grid {
    display: grid;
    grid-column: 1/1;
  }
</style>
