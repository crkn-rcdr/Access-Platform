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
   * Whether to hide the display when the current slug is the
   * same as the initial slug provided.
   */
  export let hideInitial = false;
  // https://github.com/crkn-rcdr/Access-Platform/blob/main/data/src/format/slug.ts

  const dispatch = createEventDispatcher();
  const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;
  /** @type {"READY" | "LOADING" | "MALFORMED" | "ERROR"} */
  let status: "READY" | "LOADING" | "MALFORMED" | "ERROR" =
    slug === undefined ? "LOADING" : "READY";
  let timer: NodeJS.Timeout | null = null;
  let found = false;
  let initial = slug;

  $: shouldQuery = !!slug && slug !== initial;

  async function resolve() {
    if (shouldQuery) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        status = "LOADING";
        if (regex.test(slug)) {
          try {
            const response = await $session.lapin.query("slug.resolve", slug);
            console.log(slug, "Test:", response);
            if (response === null) {
              dispatch("available", { slug: initial, status: false });
              status = "ERROR";
            } else if (!response.found) {
              dispatch("available", { slug: slug, status: true });
              found = false;
              status = "READY";
            } else {
              dispatch("available", { slug: initial, status: false });
              found = true;
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
    }
  }
  onMount(async () => {
    initial = slug;
    if (!hideInitial) await resolve();
  });
</script>

<div>
  {#if !!slug && !(slug === initial)}
    {#if status === "LOADING"}
      <NotificationBar message="Loading" />
    {:else if status === "ERROR"}
      <NotificationBar message="Slug resolver unavailable." status="fail" />
    {:else if status === "MALFORMED"}
      <NotificationBar
        message="Slugs can only contain letters, numbers, and the following symbols: _ - ."
        status="fail"
      />
    {:else if found}
      <slot name="in-use">
        <a href="/object/blurr">
          <NotificationBar message="⚠️ Slug in use" status="fail" />
        </a>
      </slot>
    {:else if !found}
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
