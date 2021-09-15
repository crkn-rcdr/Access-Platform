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
  import DmdSuccessItemsTable from "$lib/components/dmd/DmdSuccessItemsTable.svelte";
  import DmdSuccessItemLookup from "$lib/components/dmd/DmdSuccessItemLookup.svelte";
  import DmdSuccessItemUpdater from "$lib/components/dmd/DmdSuccessItemUpdater.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";

  /**
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

  /**
   *  @type { string } A variable that contains the previously selected prefix of @var accessPlatform, to ensure events are only fired when this value actually changes.
   */
  let prevPrefix: string = "oocihm";

  /**
   *  @type { boolean } A control for if the 'all items XML metadata are invalid' view is showing, or if the table of results per item will show.
   */
  let showAllInvalidError: boolean = false;

  /**
   * Sets the state of the dmd task to the initial state on page load.
   * @returns void
   */
  function resetView() {
    if (accessPlatform.prefix !== prevPrefix) {
      $dmdTasksStore[dmdTask.id].lookupState = "ready";
      $dmdTasksStore[dmdTask.id].updateState = "ready";
    }
    prevPrefix = accessPlatform.prefix;
  }

  /**
   * Adds the dmd task to the dmd task store on page load. (If it isn't in the store already)
   * @returns void
   */
  function inititalizeDmdTaskState() {
    if (!(dmdTasksStore?.getTask(dmdTask.id)?.itemStates?.size > 0)) {
      let items: DmdItemStates = new Map();
      let allInvalidCheck = true;
      for (const item of dmdTask.items) {
        allInvalidCheck = allInvalidCheck && !item.parsed;
        // This is a helpful object for keeping track of what's been done to the item while the user follows the steps required to update their metadata.
        items[item.id] = <DmdItemState>{
          slug: item.id,
          noid: null,
          foundInAccess: "No",
          foundInPreservation: "No",
          updatedInAccess: "No",
          updatedInPreservation: "No",
          shouldUpdate: true,
          parseSuccess: item.parsed && item.message === "",
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
      showAllInvalidError = allInvalidCheck;
    }
  }

  /**
   * @listens dmdTask
   * @listens dmdTasksStore
   * @description Adds the dmd task to the dmd task store, when dmdTask and dmdTaskStore are set.
   */
  $: {
    if (dmdTask && dmdTasksStore) inititalizeDmdTaskState();
  }

  /**
   * @listens $dmdTasksStore[dmdTask.id]?.lookupState
   * @description Sets @var activeStepIndex, the control of the stepper, depending on if the user has looked up the items.
   */
  $: activeStepIndex =
    $dmdTasksStore[dmdTask.id]?.lookupState === "loaded" ? 1 : 0;

  /**
   * @listens accessPlatform
   * @description Calls @function resetView when the @var accessPlatform changes.
   */
  $: {
    accessPlatform;
    resetView();
  }
</script>

{#if $dmdTasksStore && $dmdTasksStore[dmdTask.id]}
  <div
    class="metadata-form"
    class:disabled={$dmdTasksStore[dmdTask.id].updateState === "updating"}
  >
    <br />
    {#if dmdTask?.fileName}
      <h5>{dmdTask.fileName}</h5>
    {/if}
    <br />
    <NotificationBar
      message={dmdTask.process.message?.length
        ? `File parsing ${dmdTask.process.succeeded ? "warning" : "error"}: ${
            dmdTask.process.message
          }`
        : ""}
      status={dmdTask.process.succeeded ? "warn" : "fail"}
    />
    <br />
    {#if !showAllInvalidError}
      <ScrollStepper
        bind:activeStepIndex
        displayPrevious={true}
        enableAutoScrolling={false}
      >
        <ScrollStepperStep title="Select a prefix and look-up items">
          <div slot="icon">1</div>
          <DmdSuccessItemLookup dmdTaskId={dmdTask.id} bind:accessPlatform />
        </ScrollStepperStep>
        <ScrollStepperStep
          title={`Update descriptive metadata for items found`}
          isLastStep={true}
        >
          <div slot="icon">2</div>
          {#if $dmdTasksStore[dmdTask.id].lookupState !== "loading"}
            <DmdSuccessItemUpdater dmdTaskId={dmdTask.id} bind:accessPlatform />
          {/if}
        </ScrollStepperStep>
      </ScrollStepper>
    {:else}
      <NotificationBar
        status="fail"
        message={`Every item's metadata is invalid. To get an idea of what went wrong for each item, press their preview button. You can use this information to make changes to ${
          dmdTask?.fileName?.length ? dmdTask?.fileName : "the file"
        }, then try again by uploading the corrected file.`}
      />
      <br />
      <a href="/dmd/new" class="dmd-task-try-again">
        <button class="danger">Try Again</button>
      </a>
      <br />
      <br />
    {/if}
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
    <DmdSuccessItemsTable
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
