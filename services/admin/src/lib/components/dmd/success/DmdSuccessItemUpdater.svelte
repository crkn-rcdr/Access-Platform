<!--
@component
### Overview
This component allows the user to update the dmd tasks items in an access platform and/or in preservation. 

### Properties
|    |    |    |
| -- | -- | -- |
| depositor: Depositor | required | The access platform to look for the items in. |
| dmdTaskId: string | required | The 'id' of the DMDTask being processed. |

### Usage
```
<DmdItemUpdater
  dmdTaskId={dmdTask.id}
  bind:depositor
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { Depositor } from "$lib/types";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";
  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   *  @type { Depositor } The access platform to look for the items in.
   */
  export let depositor: Depositor;

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTaskId: string;

  /**
   * Passes on the work of updating the metadata of the items in the task to the dmdTasksStore
   * @returns void
   */
  function handleUpdatePressed() {
    dmdTasksStore.storeTaskItemMetadata(
      dmdTaskId,
      $session.user,
      $session.lapin,
      depositor.prefix
    );
  }
</script>

{#if $dmdTasksStore[dmdTaskId]}
  <div
    class="update-wrap auto-align auto-align__a-center auto-align__j-between "
  >
    <PrefixSelector bind:depositor />
    <span>
      <input
        name="access"
        type="checkbox"
        bind:checked={$dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
      />
      <label for="access">in Access</label>
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
  .update-wrap > *:not(:first-child) {
    margin-left: 1rem;
  }
  :global(.update-wrap select) {
    flex: 1;
  }
</style>
