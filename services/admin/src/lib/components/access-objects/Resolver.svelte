<script lang="ts">
  import { onMount } from "svelte";
  import { session } from "$app/stores";
  import { getLapin } from "$lib/lapin";

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

  const lapin = getLapin({ url: $session["apiEndpoint"], fetch: null });
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
          try {
            const response = await lapin.query("slug.resolve", slug);
            if (response === null) {
              noid = null;
            } else {
              noid = response.noid as string;
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

<div
  class="auto-align auto-align__full auto-align__column auto-align auto-align__full__j-baseline auto-align auto-align__full__wra"
>
  <label for="slug"><slot name="input">Slug:</slot></label>
  <input
    type="text"
    placeholder="Type in a slug..."
    bind:value={slug}
    on:input={resolve}
  />

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
        <div class="alert alert-danger">
          <a href="/object/{noid}">⚠️ Slug in use</a>
        </div>
      </slot>
    {:else}
      <slot name="available">✅ Slug available</slot>
    {/if}
  {/if}
</div>

<style>
  input {
    width: 100%;
  }
</style>
