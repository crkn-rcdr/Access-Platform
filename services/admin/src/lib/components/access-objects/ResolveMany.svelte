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
  import { onMount, createEventDispatcher } from "svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import PrefixSelector from "../collections/PrefixSelector.svelte";
  import type { ObjectList } from "@crkn-rcdr/access-data";
  import Grid from "svelte-grid-responsive";

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
  export let hideInitial = false;
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
  const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;
  /** @type {"READY" | "LOADING" | "MALFORMED" | "ERROR"} */
  /* let status: "READY" | "LOADING" | "MALFORMED" | "ERROR" =
    slug === undefined ? "LOADING" : "READY"; */

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
  let test: ObjectList = [];
  let unfound: string[] = [];
  let resolved;
  async function resolveMany() {
    const response = await $session.lapin.query("slug.resolveMany", slugList);

    Object.values(response).forEach((exists) => {
      if (exists.found == true) {
        test.push(exists.result);
      } else if (exists.found == false) {
        unfound.push(exists);
        console.log("unfound", unfound);
      }
      for (let resolve of test) {
        resolved = resolve.id;
        dispatch("found", resolved);
        console.log("TEST", resolved);
      }
      hideInitial = true;
    });
  }
  function cancel() {
    cancelselector = true;
    depositor = "";
    depositorPrefix = "No prefix";
  }
</script>

<div>
  <PrefixSelector bind:prefix={depositorPrefix} /><br /><br />
  {#if depositorPrefix !== ""}({depositorPrefix}){/if}
  <div class="grid">
    <textarea bind:value={depositor} />
    <textarea class="grid" bind:value={resolved} />
  </div>
  <br />
  <button class="primary lg" on:click={cancel}>Cancel</button>
  <button class="primary lg" on:click={slugSelector}>Lookup</button> <br />
</div>

<style>
  textarea {
    display: grid;
    background-color: var(--primary);
    width: 100%;
    height: 100%;
    grid-column: 1/2;
  }
  .grid {
    display: grid;
    grid-column: 2/2;
  }
</style>
