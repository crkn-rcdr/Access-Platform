<!--
@component
### Overview
This component shows the view for a dmd task that had its metadata successfully process by smelter. It allows the user to finish the processing of the descriptive metadata update by lookin up the items specified in the file, then updating their metadata and watching the progress of the update operation.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTask: SucceededDMDTask | required | The dmd task being displayed |

### Usage
```
<DmdSplitSuccessView {dmdTask} />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import type { AccessPlatform, DmdItemStates, DmdItemState } from "$lib/types";
  import ProgressBar from "$lib/components/shared/ProgressBar.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import DmdItemLookup from "$lib/components/dmd/DmdItemLookup.svelte";
  import DmdItemUpdater from "$lib/components/dmd/DmdItemUpdater.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";
  /**
   * TODO: Delete test data
   * @type { SucceededDMDTask } The dmd task being displayed
   */
  export let dmdTask: SucceededDMDTask;

  /**
   * @type { number } The control for the stepper that lets the user either lookup or update the items in the @var dmdTask
   */
  let activeStepIndex = 0;

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  let accessPlatform: AccessPlatform = {
    prefix: "oocihm",
    label: "Canadiana.org",
  };

  function inititalizeDmdTaskState() {
    if (!(dmdTasksStore?.getTask(dmdTask.id)?.itemStates?.size > 0)) {
      let items: DmdItemStates = new Map();
      for (const item of dmdTask.items) {
        items[item.id] = <DmdItemState>{
          slug: item.id,
          noid: null,
          foundInAccess: "Searching...",
          foundInPreservation: "Searching...",
          updatedInAccess: "Updating...",
          updatedInPreservation: "Updating...",
        };
      }
      dmdTasksStore.initializeTask(dmdTask.id, {
        lookupState: "ready",
        updateState: "ready",
        itemStates: items,
        errorMsg: "",
        shouldUpdateInPreservation: true,
        shouldUpdateInAccess: true,
        updatedProgressPercentage: 0,
      });
    }
  }

  $: {
    if (dmdTask && dmdTasksStore) inititalizeDmdTaskState();
  }
</script>

{#if $dmdTasksStore && $dmdTasksStore[dmdTask.id]}
  <div
    class="metadata-form"
    class:disabled={$dmdTasksStore[dmdTask.id].updateState === "updating"}
  >
    <br />
    <br />
    <NotificationBar
      message={$dmdTasksStore[dmdTask.id].errorMsg}
      status="fail"
    />

    <ScrollStepper
      bind:activeStepIndex
      displayPrevious={true}
      enableAutoScrolling={false}
    >
      <ScrollStepperStep title="Select an access platform and look-up items">
        <div slot="icon">1</div>
        <DmdItemLookup dmdTaskId={dmdTask.id} bind:accessPlatform />
      </ScrollStepperStep>
      <ScrollStepperStep
        title={`Update descriptive metadata for items found`}
        isLastStep={true}
      >
        <div slot="icon">2</div>
        {#if $dmdTasksStore[dmdTask.id].lookupState !== "loading"}
          <DmdItemUpdater dmdTaskId={dmdTask.id} bind:accessPlatform />
        {/if}
      </ScrollStepperStep>
    </ScrollStepper>
  </div>

  <div class="metadata-table">
    {#if $dmdTasksStore[dmdTask.id].updateState === "updating"}
      <ProgressBar
        progress={$dmdTasksStore[dmdTask.id].updatedProgressPercentage}
        progressText={$dmdTasksStore[dmdTask.id].updatedProgressPercentage ===
        100
          ? "updated!"
          : "updating items..."}
      />
      <br />
      <br />
    {/if}
    <DmdItemsTable
      bind:itemsToShow={dmdTask.items}
      bind:dmdTaskId={dmdTask.id}
      bind:accessPlatform
    />
  </div>
{/if}

<style>
  .disabled {
    opacity: 0.2;
    pointer-events: none;
  }
</style>
