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

  /**
   * @type {string} Slug being resolved.
   */
  export let slug = "";

  /** @type {string | null | undefined}
   * Noid that the slug resolves to, or null
   * if it doesn't. If this is provided, the resolver will trust that it's
   * correct.
   */
  export let noid: string | null | undefined = undefined;

  /**
   * @type {boolean}
   * Whether to hide the display when the current slug is the
   * same as the initial slug provided.
   */
  export let hideInitial = false;
  // https://github.com/crkn-rcdr/Access-Platform/blob/main/data/src/format/slug.ts

  /**
   * @type {string} Slug being resolved.
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

  /**
   * @type { slug: string , noid:string } The intitial slug and noid passed into the component.
   */
  const initial = { slug, noid };

  /** @type {"READY" | "LOADING" | "MALFORMED" | "ERROR"} */
  let status: "READY" | "LOADING" | "MALFORMED" | "ERROR" =
    initial.noid === undefined ? "LOADING" : "READY";

  /**
   * @type {NodeJS.Timeout | null} Used to debounce the searching of slugs.
   */
  let timer: NodeJS.Timeout | null = null;

  /**
   * Searches the backend for an object by the inputted slug. It also shows various error states to the user.
   * @returns void
   */
  async function resolve() {
    if (shouldQuery) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        status = "LOADING";
        noid = undefined;
        if (regex.test(slug)) {
          try {
            const response = await $session.lapin.query("slug.resolve", slug);
            if (response === null) {
              noid = null;
              dispatch("available", { slug: initial.slug, status: true });
            } else if (response.noid != initial.noid) {
              noid = response.noid as string;
              dispatch("available", { slug: initial.slug, status: false });
            }
            status = "READY";
          } catch (e) {
            noid = null;
            status = "ERROR";
          }
        } else {
          noid = null;
          status = "MALFORMED";
        }
      }, 50);
    } else if (slug === initial.slug) {
      status = "READY";
    }
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var initial object is set with the @var slug and @var noid that were passed into the component. Then, the resolve method is called.
   */
  onMount(async () => {
    initial.noid = noid;
    initial.slug = slug;
    await resolve();
  });

  /**
   * @listens slug
   * @listens initial
   * @description A reactive code block that is executed any time the @var slug or @initial changes. It sets @var shouldQuery, which controls if the @function resolve method actually sends the request to the backend, or shows an error state instead.
   */
  $: shouldQuery =
    !!slug && (slug !== initial.slug || initial.noid === undefined);
</script>

<div>
  {#if !!slug && !(hideInitial && slug === initial.slug)}
    {#if status === "LOADING"}
      <NotificationBar message="Loading" />
    {:else if status === "ERROR"}
      <NotificationBar message="Slug resolver unavailable." status="fail" />
    {:else if status === "MALFORMED"}
      <NotificationBar
        message="Slugs can only contain letters, numbers, and the following symbols: _ - ."
        status="fail"
      />
    {:else if noid && noid !== initial.noid}
      <slot name="in-use">
        <a href="/object/{noid}">
          <NotificationBar message="⚠️ Slug in use" status="fail" />
        </a>
      </slot>
    {:else if !noid || noid !== initial.noid}
      <slot name="available">
        <NotificationBar message="✅ Slug available" status="success" />
      </slot>
    {/if}
  {/if}
</div>

<input
  type="text"
  placeholder="Type in a slug..."
  bind:value={slug}
  on:input={resolve}
/>

<style>
  input {
    width: 100%;
  }
</style>
