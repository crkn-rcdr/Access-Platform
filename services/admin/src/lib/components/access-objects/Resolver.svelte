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

  export let runInitial: boolean = false;

  export let alwaysShowIfFound: boolean = false;

  export let errorMsg: string = "⚠️ Slug in use";

  /**
   * @type {"sm" | "rg"}
   * To display the resolve component in a small form or in full form
   */
  export let size: "sm" | "rg" = "rg";

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

  /** @type {"READY" | "LOADING" | "MALFORMED" | "ERROR" | "UNCHANGED"}
   * Indicates if the slug is available or not, or if the component is loading.
   */
  let status: "READY" | "LOADING" | "MALFORMED" | "ERROR" | "UNCHANGED" =
    slug === undefined ? "LOADING" : "READY";

  /**
   * @type {NodeJS.Timeout | null} Used to debounce the searching of slugs.
   */
  let timer: NodeJS.Timeout | null = null;

  let intitalSlug = "";
  let intitalNoid = "";
  let initialResult;
  let previous = "";
  let initialized = false;
  let hasSearched = false;
  /**
   * Searches the backend for an object by the inputted slug. It also shows various error states to the user.
   * @returns void
   */
  async function resolve() {
    if (slug !== previous && slug !== intitalSlug) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
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
        hasSearched = true;
      }, 50);
    } else if (slug === intitalSlug) {
      status = "UNCHANGED";
      isFound = initialResult;
      noid = intitalNoid;
    }
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var initial object is set with the @var slug and @var noid that were passed into the component. Then, the resolve method is called.
   */
  onMount(async () => {
    if (runInitial) await resolve();
    previous = slug;
    intitalSlug = slug;
    intitalNoid = noid;
    initialResult = isFound;
    initialized = true;
  });

  afterUpdate(async () => {
    if (initialized) await resolve();
    previous = slug;
  });
</script>

{#if size === "rg"}
  <div>
    {#if !!slug && ((hasSearched && status !== "UNCHANGED") || alwaysShowIfFound)}
      {#if status === "LOADING"}
        <NotificationBar message="Loading" />
      {:else if status === "ERROR"}
        <NotificationBar message="Slug resolver unavailable." status="fail" />
      {:else if status === "MALFORMED"}
        <NotificationBar
          message="Slugs can only contain letters, numbers, and the following symbols: _ - ."
          status="fail"
        />
      {:else if isFound}
        <slot name="in-use">
          <a target="_blank" href={`/object/edit/${noid}`}>
            <NotificationBar message={errorMsg} status="fail" />
          </a>
        </slot>
      {:else if !isFound}
        <slot name="available">
          <NotificationBar message="✅ Slug available" status="success" />
        </slot>
      {/if}
    {/if}
  </div>
{:else if !!slug && ((hasSearched && status !== "UNCHANGED") || alwaysShowIfFound)}
  {#if status === "LOADING"}
    <span data-tooltip="Loading">...</span>
  {:else if status === "ERROR"}
    <span data-tooltip="Slug resolver unavailable.">❌</span>
  {:else if status === "MALFORMED"}
    <span
      data-tooltip="Slugs can only contain letters, numbers, and the following symbols: _ - ."
      >❌</span
    >
  {:else if isFound}
    <slot name="in-use">
      <a target="_blank" href={`/object/edit/${noid}`}>
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
