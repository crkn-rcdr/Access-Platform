<!--
@component
### Overview
This component is a button that shows a loading indicator when its property, showLoader, is true

### Properties
|    |    |    |
| -- | -- | -- |
| buttonClass: string  | optional | The html class attribute for the button. |
| showLoader: boolean | optional | The state of the button, either to show the loading indicator or not. |
| disabled: boolean | optional | If the user should be able to use the button or not. |

### Usage
```
<LoadingButton
  buttonClass="primary"
  showLoader={true}
  on:clicked={(event) => data = event.detail )}
>
  <span slot="content">
    click me!
  </span>
</LoadingButton>
```
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  /**
   * @type { string } The html class attribute for the button
   */
  export let buttonClass: string = "primary";

  /**
   * @type { boolean } The state of the button, either to show the loading indicator or not.
   */
  export let showLoader: boolean = false;
  /**
   * @type { boolean } If the user should be able to use the button or not
   */
  export let disabled: boolean = false;
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

<button class={buttonClass} on:click={handleClicked} {disabled}>
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
