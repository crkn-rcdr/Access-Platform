<script lang="ts">
  import { onMount } from "svelte";

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
  const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;
  const initial = { slug, noid };
  $: shouldQuery =
    !!slug && (slug !== initial.slug || initial.noid === undefined);

  /** @type {"READY" | "LOADING" | "MALFORMED" | "ERROR"} */
  let status: "READY" | "LOADING" | "MALFORMED" | "ERROR" =
    initial.noid === undefined ? "LOADING" : "READY";
  let timer: NodeJS.Timeout | null = null;

  async function resolve() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      status = "LOADING";
      if (shouldQuery) {
        noid = undefined;
        if (regex.test(slug)) {
          const response = await fetch(`/slug/resolve/${slug}.json`, {
            method: "GET",
            credentials: "same-origin",
          });
          if (response.status === 200) {
            noid = (await response.json()).noid as string;
            status = "READY";
          } else {
            noid = null;
            status = "ERROR";
          }
        } else {
          noid = null;
          status = "MALFORMED";
        }
      } else if (slug === initial.slug) {
        status = "READY";
        noid = initial.noid;
      }
    }, 50);
  }
  onMount(async () => {
    await resolve();
    initial.noid = noid;
  });
</script>

<div class="children-inline auto-align auto-align__a-baseline">
  <label for="slug"><slot name="input">Slug:</slot></label>
  <input type="text" bind:value={slug} on:input={resolve} />

  {#if !!slug && !(hideInitial && slug === initial.slug)}
    {#if status === "LOADING"}
      Loading
    {:else if status === "ERROR"}
      <span class="danger">Slug resolver unavailable.</span>
    {:else if status === "MALFORMED"}
      Slugs can only contain letters, numbers, and the following symbols: <code
        >_ - .</code
      >
    {:else if noid}
      <slot name="in-use">
        <a href="/object/{noid}">⚠️ Slug in use</a>
      </slot>
    {:else}
      <slot name="available">✅ Slug available</slot>
    {/if}
  {/if}
</div>

<style>
  .children-inline > * {
    margin-right: var(--sm-size);
  }
  .children-inline input {
    flex: 9;
  }
</style>
