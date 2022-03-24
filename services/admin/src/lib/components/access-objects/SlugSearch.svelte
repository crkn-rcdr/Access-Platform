<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import IoMdRefresh from "svelte-icons/io/IoMdRefresh.svelte";
  import Loading from "../shared/Loading.svelte";

  export let searchOnLoad: boolean = true;
  export let slug;
  export let noid = "";
  export let found = false;
  export let tooltip = "";

  let invalidErrorMessage =
    "Slugs can only contain letters, numbers, and the following symbols: _ - .";
  let foundErrorMessage = "⚠️ Slug in use";

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

  let valid = true;
  let initital: string = "";
  let inititalResult;
  let loading = false;
  let hasSearched = false;

  async function sendSearchRequest() {
    loading = true;
    const response = await $session.lapin.query("slug.resolve", slug);
    found = response.found;
    if (response.found) {
      noid = response.result.id;
    }
    dispatch("slugValidity", !found && valid);
    loading = false;
  }

  function search() {
    if (!slug?.length) return;
    if (slug === initital && !searchOnLoad) {
      found = inititalResult;
      valid = regex.test(slug);
      return;
    }
    if (!initital.length) initital = slug;
    loading = true;

    valid = regex.test(slug);

    if (timer) clearTimeout(timer);

    timer = setTimeout(async () => {
      await sendSearchRequest();
    }, 50);
  }

  onMount(() => {
    initital = slug;
    inititalResult = found;
  });

  $: {
    slug;
    if (searchOnLoad || hasSearched) search();
    hasSearched = true;
  }

  $: {
    if (noid)
      foundErrorMessage = `<a href ="/object/edit/${noid}" target="_blank">⚠️ Slug in use.</a>`;
  }
</script>

{#if !valid}
  <NotificationBar status="fail" message={invalidErrorMessage} />
{/if}

{#if found}
  {#if tooltip.length}
    <div data-tooltip={tooltip}>
      <NotificationBar status="fail" message={foundErrorMessage} />
    </div>
  {:else}
    <NotificationBar status="fail" message={foundErrorMessage} />
  {/if}
{/if}

<div class="input-wrap auto-align auto-align__a-center">
  {#if loading}
    <span class="loader">
      <Loading size="sm" backgroundType="gradient" />
    </span>
  {:else if found}
    <span
      on:click={sendSearchRequest}
      class="icon"
      data-tooltip="Retry look-up"
      data-tooltip-flow="right"
    >
      <IoMdRefresh />
    </span>
  {/if}
  <input placeholder="Type in a slug..." bind:value={slug} />
</div>

<style>
  .input-wrap {
    width: 100%;
  }
  input {
    flex: 9;
  }
  .icon {
    margin-right: 1rem;
    cursor: pointer;
    color: var(--secondary);
  }
  .loader {
    margin-right: 1rem;
  }
</style>
