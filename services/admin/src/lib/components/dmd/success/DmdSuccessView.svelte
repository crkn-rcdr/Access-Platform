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
  import type { Depositor, DmdItemStates, DmdItemState } from "$lib/types";
  import ProgressBar from "$lib/components/shared/ProgressBar.svelte";
  import DmdSuccessItemsTable from "$lib/components/dmd/success/DmdSuccessItemsTable.svelte";
  import DmdSuccessItemUpdater from "$lib/components/dmd/success/DmdSuccessItemUpdater.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";

  /**
   * @type { SucceededDMDTask } The dmd task being displayed
   */
  export let dmdTask: SucceededDMDTask;

  /**
   *  @type { Depositor } The access platform to look for the items in.
   */
  let depositor: Depositor | null = null;

  /*{
    prefix: "none",
    label: "",
  };*/

  /**
   *  @type { string } A variable that contains the previously selected prefix of @var depositor, to ensure events are only fired when this value actually changes.
   */
  //let prevPrefix: string = "oocihm";

  /**
   *  @type { boolean } A control for if the 'all items XML metadata are invalid' view is showing, or if the table of results per item will show.
   */
  let showAllInvalidError: boolean = false;

  /**
   *  @type { boolean } The message to show if none of the items are found to be valid.
   */
  let showAllInvalidErrorMsg: string = "";

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
          updatedInAccessMsg: "",
          updatedInPreservation: "No",
          updatedInPreservationMsg: "",
          shouldUpdate: item.parsed,
          parseSuccess: item.parsed, //&& item.message === "",
        };
      }
      dmdTasksStore.initializeTask(dmdTask.id, {
        task: dmdTask,
        updateState: "ready",
        itemStates: items,
        resultMsg: "",
        shouldUpdateInPreservation: true,
        shouldUpdateInAccess: true,
        updatedProgressPercentage: 0,
      });
      showAllInvalidError = allInvalidCheck;
      showAllInvalidErrorMsg = `${
        dmdTask?.items?.length
          ? "Every item's metadata is invalid. To get an idea of what went wrong for each item, press their preview button. You can use this information to m"
          : "No items found. M"
      }ake changes to ${
        dmdTask?.fileName?.length ? dmdTask?.fileName : "the file"
      }, then try again by uploading the corrected file.`;
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
   * @listens depositor
   * @description Calls @function resetView when the @var depositor changes.
   */
  /*$: {
    depositor;
    resetView();
  }
   function resetView() {
    if (depositor?.prefix !== prevPrefix) {
      $dmdTasksStore[dmdTask.id].updateState = "ready";
    }
    prevPrefix = depositor?.prefix;
  }
  */
</script>

{#if $dmdTasksStore && $dmdTasksStore[dmdTask.id]}
  <div
    class="metadata-form"
    class:disabled={$dmdTasksStore[dmdTask.id].updateState === "updating"}
  >
    {#if dmdTask?.fileName}
      <h5>{dmdTask.fileName}</h5>
    {/if}

    {#if $dmdTasksStore[dmdTask.id].updateState === "ready"}
      <p>
        Please take a moment to preview the metadata updates for each item in
        the table. Then, select a depositor and choose where to apply the
        updates to activate the 'Update Descriptive Metadata' button. You can
        use the checkboxes in the table to control which items are updated when
        pressing the update button.
      </p>
      <br />
    {/if}

    <NotificationBar
      message={dmdTask.process.message?.length
        ? `File parsing ${dmdTask.process.succeeded ? "warning" : "error"}: ${
            dmdTask.process.message
          }`
        : ""}
      status={dmdTask.process.succeeded ? "warn" : "fail"}
    />

    <NotificationBar
      message={$dmdTasksStore[dmdTask.id].resultMsg}
      status={$dmdTasksStore[dmdTask.id].updateState === "error"
        ? "fail"
        : "success"}
    />

    {#if $dmdTasksStore[dmdTask.id].resultMsg?.length}
      <br />
    {/if}

    {#if !showAllInvalidError}
      <DmdSuccessItemUpdater dmdTaskId={dmdTask.id} bind:depositor />
      <br />
      <br />
    {:else}
      <NotificationBar status="fail" message={showAllInvalidErrorMsg} />
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
          ? "done!"
          : "files updated..."}
      />
      <br />
    {/if}

    <DmdSuccessItemsTable
      bind:itemsToShow={dmdTask.items}
      bind:dmdTaskId={dmdTask.id}
      bind:depositor
    />
  </div>
{/if}

<style>
  .disabled {
    opacity: 0.2;
    pointer-events: none;
  }
</style>
