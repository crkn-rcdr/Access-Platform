<!--
@component
### Overview
This component allows the user to update the dmd tasks items in an access platform and/or in presercvation. 

### Properties
|    |    |    |
| -- | -- | -- |
| accessPlatform: AccessPlatform | required | The access platform to look for the items in. |
| dmdTaskId: string | required | The 'id' of the DMDTask being processed. |
| state: "ready" or "updating" or "updated" or "error" | optional | This variable keeps track of the state of the component, to show relevant messages to the user. |
| itemsLookupAndUpdateResults: (DmdLoadedParseRecord or DmdUpdatedParseRecord)[] | optional | The dmdtask items to update (holds both results of the lookup and update.) |
| shouldUpdateInAccess: boolean | optional | If the request to update should be sent to the selected access platform. |
| shouldUpdateInPreservation: boolean | optional | If the request to update should be sent to preservation. |
| updatedProgressPercentage: number | optional | The completion percentage of the updating process |

### Usage
```
<DmdItemUpdater
  dmdTaskId={dmdTask.id}
  bind:state={updateState}
  bind:accessPlatform
  bind:shouldUpdateInPreservation
  bind:shouldUpdateInAccess
  bind:itemsLookupAndUpdateResults
  bind:updatedProgressPercentage
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { AccessPlatform } from "$lib/types";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  export let accessPlatform: AccessPlatform;

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTaskId: string;

  function handleUpdatePressed() {
    dmdTasksStore.storeTaskItemsToSwift(
      dmdTaskId,
      $session.user,
      $session.lapin
    );
  }
</script>

{#if $dmdTasksStore[dmdTaskId]}
  <div
    class="update-wrap auto-align auto-align__a-center auto-align__j-between "
  >
    <span>
      <input
        name="access"
        type="checkbox"
        bind:checked={$dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
      />
      <label for="access">in {accessPlatform["label"]}</label>
    </span>
    <span>
      <input
        name="preservation"
        type="checkbox"
        bind:checked={$dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
      />
      <label for="preservation">in Preservation</label>
    </span>
    {#if $dmdTasksStore[dmdTaskId].shouldUpdateInAccess || $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
      <button class="primary" on:click={handleUpdatePressed}>
        {$dmdTasksStore[dmdTaskId].updateState === "updated"
          ? "Update Descriptive Metadata Records Again"
          : "Update Descriptive Metadata Records"}
      </button>
    {/if}
  </div>
{/if}

<style>
  .update-wrap {
    width: 100%;
  }
</style>
