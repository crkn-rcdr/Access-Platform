<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*

**Example two**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { onMount } from "svelte";
  import { getStores } from "$app/stores";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import { createEventDispatcher } from "svelte";

  const { session } = getStores<Session>();

  /**
   * @type {string} Slug being resolved.
   */
  export let slug = "";
  /**
   * Noid that the slug resolves to, or null
   * if it doesn't. If this is provided, the resolver will trust that it's
   * correct.
   */
  export let noid: string | null | undefined = undefined;
  /**
   * Whether to hide the display when the current slug is the
   * same as the initial slug provided.
   */
  export let hideInitial = false;
  // https://github.com/crkn-rcdr/Access-Platform/blob/main/data/src/format/slug.ts

  const dispatch = createEventDispatcher();
  const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;
  const initial = { slug, noid };
  $: shouldQuery =
    !!slug && (slug !== initial.slug || initial.noid === undefined);

  /** @type {"READY" | "LOADING" | "MALFORMED" | "ERROR"} */
  let status: "READY" | "LOADING" | "MALFORMED" | "ERROR" =
    initial.noid === undefined ? "LOADING" : "READY";
  let timer: NodeJS.Timeout | null = null;

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
  onMount(async () => {
    initial.noid = noid;
    initial.slug = slug;
    await resolve();
  });
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
