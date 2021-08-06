<!--
@component
### Overview
A handy component for adding switch like syntax to your svelte template code.

### Properties
|    |    |    |
| -- | -- | -- |
| checkVal: any  | required | The value to pass into the switch, that it uses to determine which case to show. |

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
  import { setContext } from "svelte";
  import { writable } from "svelte/store";

  /**
   * @type {any} The value to pass into the switch, that it uses to determine which case to show.
   */
  export let checkVal: any;

  /**
   * @type {Writable<any>} A store that the cases use to determine if they should display their contents.
   */
  let checkStore = writable(checkVal);

  /**
   * @type {Writable<boolean>} A store that the cases manipulate, which the default case uses to determine if it should display its contents.
   */
  let showDefaultStore = writable(true);

  /**
   * Adds the stores to the shared context for this component and its childred, the SwitchCase and SwitchDefault. This allows the cases to react when the value changes.
   */
  setContext("checkStore", checkStore);
  setContext("showDefaultStore", showDefaultStore);

  /**
   * Updates the value of the check store and default stores, causing the case and default components to re-evaluate which one of them should be shown.
   * @param checkVal
   * @returns void
   */
  function updateMethod(checkVal: any) {
    checkStore.set(checkVal);
    showDefaultStore.set(true);
  }

  /**
   * @listens checkVal
   * @description calls @function updateMethod when the @var checkVal changes
   */
  $: {
    updateMethod(checkVal);
  }
</script>

<slot />
