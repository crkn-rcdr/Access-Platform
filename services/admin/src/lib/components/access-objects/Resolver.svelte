<!--
@component
### Overview
The resolver component allows the user to enter a slug, and then a request is sent to the backend to vheck if an object exists with that slug. Error states are shown for invalid slugs or otherwise.

### Properties
|    |    |    |
| -- | -- | -- |
| slug : string | optional | Slug being resolved. |
| size: "sm" or "rg"  | optional | To display the resolve component in a small form or in full form. |
| hideInitial : boolean | optional | Whether to hide the display when the current slug is the same as the initial slug provided. |
| hideUnavailableMsg: boolean | optional | If the unavailable message should be hidden. Useful for custom errors. |

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
  import { onMount, createEventDispatcher, afterUpdate } from "svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

  /**
   * @type {string} Slug being resolved.
   */
  export let slug;

  /**
   * @type {boolean}
   * Whether to hide the display when the current slug is the
   * same as the initial slug provided.
   */
  export let hideInitial = false;

  export let runInitial: boolean = false;

  /**
   * @type {"sm" | "rg"}
   * To display the resolve component in a small form or in full form
   */
  export let size: "sm" | "rg" = "rg";

  /**
   * @type {boolean}
   * If the unavailable message should be hidden. Useful for custom errors.
   */
  export let hideUnavailableMsg: boolean = false;

  /**
   * @type {string}
   * The noid of item resolved, if the slug resolves to anything.
   */
  export let noid = "";

  /**
   * @type {boolean} If the slug was isFound in the database
   */
  export let isFound = false;

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

  /** @type {"READY" | "LOADING" | "MALFORMED" | "ERROR"}
   * Indicates if the slug is available or not, or if the component is loading.
   */
  let status: "READY" | "LOADING" | "MALFORMED" | "ERROR" =
    slug === undefined ? "LOADING" : "READY";

  /**
   * @type {NodeJS.Timeout | null} Used to debounce the searching of slugs.
   */
  let timer: NodeJS.Timeout | null = null;

  let previous = "";
  let initialized = false;
  /**
   * Searches the backend for an object by the inputted slug. It also shows various error states to the user.
   * @returns void
   */
  async function resolve() {
    if (slug !== previous) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        console.log("slug changed: ", slug, " p:", previous);
        status = "LOADING";
        noid = "";
        if (regex.test(slug)) {
          try {
            const response = await $session.lapin.query("slug.resolve", slug);
            if (response === null) {
              dispatch("available", { slug, status: false });
              status = "ERROR";
            } else if (!response.found) {
              dispatch("available", { slug, status: true });
              isFound = false;
              status = "READY";
            } else {
              dispatch("available", { slug, status: false });
              isFound = true;
              noid = response.result.id;
              status = "READY";
            }
          } catch (e) {
            status = "ERROR";
          }
        } else {
          status = "MALFORMED";
        }
      }, 50);
    } else {
      console.log("slug not changed: ", slug, " p:", previous);
    }
  }

  /**
   * Checks if the component has been rendered and if the results should be hidden the first time that @var slug is set. Calls @function resolve appropriately
   * @returns void
   */
  async function resolveOnChange() {
    await resolve();
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var initial object is set with the @var slug and @var noid that were passed into the component. Then, the resolve method is called.
   */
  onMount(async () => {
    console.log("s: ", slug, " p: ", previous);
    if (runInitial) await resolve();
    previous = slug;
    initialized = true;
  });

  afterUpdate(async () => {
    console.log("s: ", slug, " p: ", previous);
    if (initialized) await resolve();
    previous = slug;
  });
</script>

{#if size === "rg"}
  <div>
    {#if !!slug && !hideInitial}
      {#if status === "LOADING"}
        <NotificationBar message="Loading" />
      {:else if status === "ERROR"}
        <NotificationBar message="Slug resolver unavailable." status="fail" />
      {:else if status === "MALFORMED"}
        <NotificationBar
          message="Slugs can only contain letters, numbers, and the following symbols: _ - ."
          status="fail"
        />
      {:else if isFound && !hideUnavailableMsg}
        <slot name="in-use">
          <a target="_blank" href={`/object/${noid}`}>
            <NotificationBar message="⚠️ Slug in use" status="fail" />
          </a>
        </slot>
      {:else if !isFound}
        <slot name="available">
          <NotificationBar message="✅ Slug available" status="success" />
        </slot>
      {/if}
    {/if}
  </div>
{:else if !!slug && !hideInitial}
  {#if status === "LOADING"}
    <span data-tooltip="Loading">...</span>
  {:else if status === "ERROR"}
    <span data-tooltip="Slug resolver unavailable.">❌</span>
  {:else if status === "MALFORMED"}
    <span
      data-tooltip="Slugs can only contain letters, numbers, and the following symbols: _ - ."
      >❌</span
    >
  {:else if isFound && !hideUnavailableMsg}
    <slot name="in-use">
      <a target="_blank" href={`/object/${noid}`}>
        <span
          data-tooltip="⚠️ Slug in use, click to unassign it, or enter another."
          >❌</span
        >
      </a>
    </slot>
  {:else if !isFound}
    <slot name="available">
      <span data-tooltip="Slug available">✅</span>
    </slot>
  {/if}
{/if}

<input
  class:rg={size === "rg"}
  class:sm={size === "sm"}
  type="text"
  placeholder="Type in a slug..."
  bind:value={slug}
  on:input={resolve}
/>

<style>
  input.rg {
    width: 100%;
  }
  input.sm {
    padding: 0 0.25rem !important;
  }
</style>
