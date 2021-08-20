<script lang="ts">
  import Loading from "$lib/components/shared/Loading.svelte";
  import { createEventDispatcher } from "svelte";

  /**
   * @type { string } The html class attribute for the button
   */
  export let buttonClass: string = "primary";

  /**
   * @type { boolean } The state of the button, either to show the loading indicator or not.
   */
  export let showLoader = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Sends the clicked event of the button to the parent components using @var dispatcher.
   * @param event
   * @returns void
   */
  function handleClicked(event) {
    dispatch("clicked", event);
  }
</script>

<button class={buttonClass} on:click={handleClicked}>
  <span
    class="auto-align auto-align__a-center"
    class:loading-button={showLoader}
  >
    {#if showLoader}
      <Loading size="sm" />
    {/if}
    <span class="content">
      <slot name="content" />
    </span>
  </span>
</button>

<style>
  .content {
    margin-left: var(--margin-sm);
  }
</style>
