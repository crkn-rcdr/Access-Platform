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

  import PrefixSelector from "../collections/PrefixSelector.svelte";
  import type { ObjectList } from "@crkn-rcdr/access-data";

  /**
   * @type {string} Slug being resolved.
   */

  export let slugList: ObjectList = [];

  let depositorPrefix = "";
  let depositor = "undefined";

  /**
   * @type {boolean}
  /**
   * Whether to hide the display when the current slug is the
   * same as the initial slug provided.
   */
  let hideInitial = false;
  // https://github.com/crkn-rcdr/Access-Platform/blob/main/data/src/format/slug.ts

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  let cancelselector = false;

  /**
   * @type {RegExp} A regular expression that will validate strings as slugs.
   */

  /**
   * @type {NodeJS.Timeout | null} Used to debounce the searching of slugs.
   */
  let timer: NodeJS.Timeout | null = null;

  /**
   * @type {boolean} If the slug was isFound in the database
   */
  let isFound = false;

  /**
   * @type {string} The intitial slug passed into the component.
   */
  /*   let initial = slug; */

  /**
   * Searches the backend for an object by the inputted slug. It also shows various error states to the user.
   * @returns void
   */

  async function slugSelector() {
    let slugToFind = depositor.split(/[,|\s]/);
    for (var index in slugToFind) {
      if (
        depositor !== "" &&
        depositor !== undefined &&
        slugToFind[index].indexOf(".") === -1
      ) {
        var prefixedSlug = depositorPrefix + "." + slugToFind[index];
      } else if (
        depositorPrefix == "" &&
        slugToFind[index].indexOf(".") === -1
      ) {
        prefixedSlug = slugToFind[index];
      }
      slugList.push(prefixedSlug);
    }
    await resolveMany();
  }

  async function resolveMany() {
    const response = await $session.lapin.query("slug.resolveMany", slugList);
    dispatch("found", Object.values(response));
    hideInitial = true;
  }
  function cancel() {
    cancelselector = true;
    depositor = "";
    depositorPrefix = "No prefix";
  }
</script>

<div>
  {#if !hideInitial}
    <PrefixSelector bind:prefix={depositorPrefix} /><br /><br />
    {#if depositorPrefix !== ""}({depositorPrefix}){/if}
    <div class="grid">
      <textarea bind:value={depositor} />
    </div>
    <br />
    <button class="primary lg" on:click={cancel}>Cancel</button>
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
