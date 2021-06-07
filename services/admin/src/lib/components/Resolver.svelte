<script lang="ts">
  import { onMount } from "svelte";

  /**
   * @type {string} Slug being resolved.
   */
  export let slug = "";
  /**
   * @type {string | null | undefined} Noid that the slug resolves to, or null
   * if it doesn't. If this is provided, the resolver will trust that it's
   * correct.
   */
  export let noid: string = undefined;
  const initial = { slug, noid };

  /** @type {"READY" | "LOADING" | "MALFORMED" | "ERROR"} */
  let status: string = initial.noid === undefined ? "LOADING" : "READY";
  let timer: number;
  async function resolve() {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      status = "LOADING";
      if (slug) {
        const response = await fetch(`/slug/resolve/${slug}.json`, {
          method: "GET",
          credentials: "same-origin",
        });

        if (response.status === 200) {
          noid = await response.json();
          status = "READY";
        } else if (slug === initial.slug) {
          status = "READY";
          noid = initial.noid;
        } else {
          noid = null;
          status = "ERROR";
        }
      }
    }, 50);
  }

  onMount(async () => {
    await resolve();
    status = "READY";
    initial.noid = noid;
  });
</script>

<div>
  <label for="slug"><slot name="input">Slug:</slot></label>
  <input type="text" bind:value={slug} on:input={resolve} />
  {#if !!slug && !(slug === initial.slug)}
    {#if Object.values(noid)[0] !== null}
      <slot name="in-use">
        <a href="/access/{noid}">⚠️ Slug in use</a>
      </slot>
    {:else}
      <slot name="available">✅ Slug available</slot>
    {/if}
  {/if}
</div>
