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

  let disabled: boolean = true;

  /**
   * Passes on the work of updating the metadata of the items in the task to the dmdTasksStore
   * @returns void
   */
  async function handleUpdatePressed() {
    await dmdTasksStore.storeTaskItemMetadata(
      dmdTaskId,
      $session.user,
      $session.lapin,
      depositor?.prefix
    );
  }

  $: {
    let numItems = 0;
    for (const itemSlug in $dmdTasksStore[dmdTaskId].itemStates) {
      if ($dmdTasksStore[dmdTaskId].itemStates[itemSlug].shouldUpdate)
        numItems++;
    }

    disabled =
      depositor === null ||
      numItems === 0 ||
      !(
        $dmdTasksStore[dmdTaskId].shouldUpdateInAccess ||
        $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation
      );
  }
</script>

{#if $dmdTasksStore[dmdTaskId]}
  <div class="update-wrap auto-align auto-align__a-end auto-align__j-between ">
    <PrefixSelector bind:depositor />

    <div class="auto-align auto-align__column auto-align__a-end">
      <div class="auto-align auto-align__a-end auto-align__j-between">
        <span class="checkbox">
          <input
            name="access"
            type="checkbox"
            bind:checked={$dmdTasksStore[dmdTaskId].shouldUpdateInAccess}
          />
          <label for="access">Update in Access</label>
        </span>
        <span class="checkbox">
          <input
            name="preservation"
            type="checkbox"
            bind:checked={$dmdTasksStore[dmdTaskId].shouldUpdateInPreservation}
          />
          <label for="preservation">Update in Preservation</label>
        </span>
      </div>
      <button class="primary" {disabled} on:click={handleUpdatePressed}>
        {$dmdTasksStore[dmdTaskId].updateState === "error"
          ? "Try Updating Descriptive Metadata Records Again"
          : "Update Descriptive Metadata Records"}
      </button>
    </div>
  </div>
{/if}

<style>
  .update-wrap {
    width: 100%;
  }
  .update-wrap > *:not(:first-child) {
    margin-left: 1rem;
  }
  :global(.update-wrap span:first-child) {
    flex: 1;
  }
  :global(.update-wrap > div) {
    flex: 3;
  }

  .checkbox:first-child {
    margin-right: var(--margin-sm);
  }
</style>
