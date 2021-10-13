<!--
@component
### Overview
This components takes the items in a successfull dmd task and looks them up in a selected access platform and in preservation.

### Properties
|    |    |    |
| -- | -- | -- |
| depositor: Depositor | required | The access platform to look for the items in. |
| dmdTaskId: string | required | The id of the dmd task. |

### Usage
```
<DmdItemLookup
  bind:dmdTaskId={dmdTask.id}
  bind:depositor
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import type { Depositor } from "$lib/types";
  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import LoadingButton from "$lib/components/shared/LoadingButton.svelte";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTaskId: string;

  /**
   *  @type { Depositor } The access platform to look for the items in.
   */
  export let depositor: Depositor;

  /**
   * Passes on the work of looking up the items in the task to the dmdTasksStore
   * @returns void
   */
  function handleLookupPressed() {
    dmdTasksStore.lookupTaskItems(dmdTaskId, depositor.prefix, $session.lapin);
  }
</script>

{#if $dmdTasksStore[dmdTaskId]}
  <div
    class="look-up-wrap auto-align auto-align__a-center auto-align__j-between "
  >
    <div class="select-wrap">
      <PrefixSelector bind:depositor />
    </div>

    {#if depositor?.prefix?.length}
      <LoadingButton
        buttonClass={`${
          $dmdTasksStore[dmdTaskId].lookupState === "ready"
            ? "primary"
            : "secondary"
        }`}
        showLoader={$dmdTasksStore[dmdTaskId].lookupState === "loading"}
        on:clicked={handleLookupPressed}
      >
        <span slot="content">
          {$dmdTasksStore[dmdTaskId].lookupState !== "loading"
            ? $dmdTasksStore[dmdTaskId].lookupState === "loaded"
              ? "Look-up Again"
              : "Look-up"
            : "Looking-up..."}
        </span>
      </LoadingButton>
    {/if}
  </div>
{/if}

<style>
  .look-up-wrap {
    width: 100%;
  }
  .select-wrap {
    flex: 8;
    margin-right: 1rem;
  }
</style>
