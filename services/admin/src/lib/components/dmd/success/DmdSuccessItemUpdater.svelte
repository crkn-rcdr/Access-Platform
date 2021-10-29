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
  let updatingIn: string;

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
      !(updatingIn === "access" || updatingIn === "preservation");
  }

  function onChange(event) {
    updatingIn = event.currentTarget.value;
    if (updatingIn === "access") {
      $dmdTasksStore[dmdTaskId].shouldUpdateInAccess = true;
      $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation = false;
    } else if (updatingIn === "preservation") {
      $dmdTasksStore[dmdTaskId].shouldUpdateInAccess = false;
      $dmdTasksStore[dmdTaskId].shouldUpdateInPreservation = true;
    }
  }
</script>

{#if $dmdTasksStore[dmdTaskId]}
  <div
    class="update-wrap auto-align auto-align__a-center auto-align__j-between"
  >
    <PrefixSelector bind:depositor />
    <label>
      <input
        checked={updatingIn === "access"}
        on:change={onChange}
        type="radio"
        name="amount"
        value="access"
      /> Update in Access
    </label>
    <label>
      <input
        checked={updatingIn === "preservation"}
        on:change={onChange}
        type="radio"
        name="amount"
        value="preservation"
      /> Update in Preservation
    </label>
    <!--div class="auto-align auto-align__column auto-align__a-end"-->

    <button class="primary" {disabled} on:click={handleUpdatePressed}>
      {$dmdTasksStore[dmdTaskId].updateState === "error"
        ? "Try Updating Descriptive Metadata Records Again"
        : "Update Descriptive Metadata Records"}
    </button>
    <!--/div-->
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
    flex: 2;
  }
  :global(.update-wrap > div) {
    flex: 3;
  }

  label:first-child {
    margin-right: var(--margin-sm);
  }
</style>
