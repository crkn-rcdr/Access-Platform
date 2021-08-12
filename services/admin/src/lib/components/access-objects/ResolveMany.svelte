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
  import Modal from "$lib/components/shared/Modal.svelte";

  /**
   * @type {string} Slug being resolved.
   */

  export let slugList: string[] = [];

  let depositorPrefix = "";
  let depositor = "undefined";
  let showModal = false;

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
      if (depositor !== "" && slugToFind[index].indexOf(".") === -1) {
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
    /* if (shouldQuery) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        status = "LOADING";
        if (regex.test(slug)) {
          try {
            const response = await $session.lapin.query(
              "slug.resolveMany",
              slug
            );
            console.log(slug, "Testi in many:", response);
            if (response === null) {
              dispatch("available", { slug: initial, status: false });
              status = "ERROR";
            } else if (!response.found) {
              dispatch("available", { slug: slug, status: true });
              isFound = false;
              status = "READY";
            } else {
              dispatch("available", { slug: initial, status: false });
              isFound = true;
              status = "READY";
            }
          } catch (e) {
            status = "ERROR";
          }
        } else {
          status = "MALFORMED";
        }
      }, 50);
    } else if (slug === initial) {
      status = "READY";
    } */
    const response = await $session.lapin.query("slug.resolveMany", slugList);
    console.log(slugList, "Test:", response);
  }
</script>

<!-- <Modal
  bind:open={showModal}
  title={`Paste in your SlugList after picking a Depositor`}
> -->
<div>
  <PrefixSelector bind:prefix={depositorPrefix} /><br />
</div>
{#if depositorPrefix !== ""}({depositorPrefix}){/if}
<textarea bind:value={depositor} />
<div class="buttons">
  <!--  <button on:click={cancel}>Cancel</button> -->
  <button on:click={slugSelector}>Lookup</button>
</div>
<input
  type="text"
  placeholder="Type in a slug..."
  bind:value={slugList}
  on:input={resolveMany}
/>

<!-- </Modal> -->
<style>
  input {
    width: 100%;
  }
</style>
