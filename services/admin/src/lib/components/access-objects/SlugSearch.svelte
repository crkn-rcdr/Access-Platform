<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import NotificationBar from "../shared/NotificationBar.svelte";

  export let slug;
  export let invalidErrorMessage =
    "Slugs can only contain letters, numbers, and the following symbols: _ - .";
  export let foundErrorMessage = "⚠️ Slug in use";
  export let noid;

  /**
   * @type {NodeJS.Timeout | null} Used to debounce the searching of slugs.
   */
  let timer: NodeJS.Timeout | null = null;

  /**
   * @type {RegExp} A regular expression that will validate strings as slugs.
   */
  const regex = /^[\p{L}\p{Nl}\p{Nd}\-_\.]+$/u;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  let found = true;
  let valid = true;

  function search() {
    if (!slug?.length) return;

    valid = regex.test(slug);

    if (timer) clearTimeout(timer);

    timer = setTimeout(async () => {
      const response = await $session.lapin.query("slug.resolve", slug);
      found = response.found;
      if (response.found) noid = response.result.id;
      dispatch("slugValidity", !found && valid);
    }, 50);
  }

  onMount(() => {
    search();
  });
</script>

{#if !valid}
  <NotificationBar status="fail" message={invalidErrorMessage} />
{/if}
{#if found}
  <NotificationBar status="fail" message={foundErrorMessage} />
{/if}
<div class="input-wrap auto-align auto-align__a-center">
  <input placeholder="Type in a slug..." bind:value={slug} on:input={search} />
  {#if found}
    <button class="secondary" on:click={search}>Look-up Again</button>
  {/if}
</div>

<style>
  .input-wrap {
    width: 100%;
  }
  input {
    flex: 9;
  }
  button {
    margin-left: 1rem;
    margin-top: 1rem;
  }
</style>
