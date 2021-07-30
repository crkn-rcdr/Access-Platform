<!--
@component
### Overview
The case check for the Switch component.

### Properties
|    |    |    |
| -- | -- | -- |
| caseVal: any  | required | The value that is used to determine if the case should show, if the Switch's checkVal is equal to this value, it will show its contents. |

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
  import type { Writable } from "svelte/store";

  /**
   * @type {any} The value that is used to determine if the case should show, if the Switch's checkVal is equal to this value, it will show its contents..
   */
  export let caseVal: any;

  /**
   * @type {Writable<any>} A store that the cases use to determine if they should display their contents.
   */
  let checkStore: SvelteStore<any> = getContext("checkStore");

  /**
   * @type {Writable<boolean>} A store that the cases manipulate, which the default case uses to determine if it should display its contents.
   */
  let showDefaultStore: Writable<boolean> = getContext("showDefaultStore");

  /**
   * @type {boolean} If the switch should display its contents or not.
   */
  let switchOn = false;

  /**
   * Sets the @var switchOn state depending on the values in @var checkStore and @var caseVal. It influences the value of @var showDefaultStore, which will tell the default case to display if it is still true after all cases check themselves.
   * @param $checkStore
   * @param $showDefaultStore
   * @param caseVal
   * @returns void
   */
  function checkSwitchCaseOn(
    $checkStore: any,
    $showDefaultStore: boolean,
    caseVal: any
  ) {
    switchOn = $checkStore === caseVal;
    $showDefaultStore = $showDefaultStore && !switchOn;
  }

  /**
   * @listens $checkStore, @listens caseVal, @listens $showDefaultStore
   * @description Any time the store values or @var caseVal changes the case calls @function checkSwitchCaseOn
   */
  $: {
    checkSwitchCaseOn($checkStore, $showDefaultStore, caseVal);
  }
</script>

{#if switchOn}
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
