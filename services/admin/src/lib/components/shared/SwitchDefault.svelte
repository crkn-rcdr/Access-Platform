<!--
@component
### Overview
The default case for the Switch component. To be shown if all other cases fail.

### Properties
none

### Usage
```  
<Switch bind:checkVal={state}>
  <SwitchCase caseVal="one">
  </SwitchCase>
  <SwitchCase caseVal="two">
  </SwitchCase>
  <SwitchDefault>
    ...other
  </SwitchDefault>
</Switch>
```
*Note: `bind:` is required for changes to the object and its model to be reflected in higher level components.*
-->
<script lang="ts">
  import { getContext } from "svelte";

  /**
   * @type {Writable<boolean>} A store that the cases manipulate, which the default case uses to determine if it should display its contents.
   */
  let showDefaultStore: SvelteStore<boolean> = getContext("showDefaultStore");

  /**
   * @type {boolean} If the default should display its contents or not.
   */
  let showDefaultView = false;

  /**
   * @listens showDefaultStore
   * @description Any time the value of showDefaultStore changes, the @var showDefaultView is set to the aggregate calculation made in all of the other cases through the @var showDefaultStore that has been shared with them through the parent Switch component context.
   */
  showDefaultStore.subscribe((showDefault: boolean) => {
    showDefaultView = showDefault;
  });
</script>

{#if showDefaultView}
  <div class="switch-viewer">
    <slot />
  </div>
{/if}

<style>
  .switch-viewer {
    height: 100%;
    width: 100%;
  }
</style>
