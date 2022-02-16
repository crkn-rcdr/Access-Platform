<!--
@component
### Overview
This component shows the view for a dmd task that had its metadata successfully process by smelter. It allows the user to finish the processing of the descriptive metadata update by lookin up the items specified in the file, then updating their metadata and watching the progress of the update operation.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTask: UpdateSucceededDMDTask | required | The dmd task being displayed |

### Usage
```
<DmdSplitSuccessView {dmdTask} />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { UpdateSucceededDMDTask } from "@crkn-rcdr/access-data";
  import type { Depositor, DmdItemStates, DmdItemState } from "$lib/types";
  import ProgressBar from "$lib/components/shared/ProgressBar.svelte";
  import DmdSuccessItemsTable from "$lib/components/dmd/success/DmdSuccessItemsTable.svelte";
  import DmdSuccessItemUpdater from "$lib/components/dmd/success/DmdSuccessItemUpdater.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import { dmdTasksStore } from "$lib/stores/dmdTasksStore";
  import IoMdRefresh from "svelte-icons/io/IoMdRefresh.svelte";
  import IoMdOpen from "svelte-icons/io/IoMdOpen.svelte";
  /**
   * @type { UpdateSucceededDMDTask } The dmd task being displayed
   */
  export let dmdTask: UpdateSucceededDMDTask;

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
          ? "Code 16. Every item's metadata is invalid. To get an idea of what went wrong for each item, press their preview button. You can use this information to m"
          : "Code 17. No items found. M"
      }ake changes to the file, then try again by uploading the corrected file.`;
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
        Please take a moment to preview the metadata for each item in the table.
        Then, if your metadata file does not already include prefixes on the
        ids, select a prefix option and choose where to load the metadata to.
        Then, select either access or preservation as the destination for the
        metadata update. This will activate the 'Process Metadata File' button.
        You can use the checkboxes in the table to control which items the
        metadata will be applied to when pressing the button.
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
      {#if $dmdTasksStore[dmdTask.id].updateState === "updated"}
        <button
          class="secondary"
          on:click={() => {
            location.reload();
          }}
        >
          <span class="auto-align auto-align__a-center">
            <span class="icon"><IoMdRefresh /></span>
            Re-process File
          </span>
        </button>

        <!-- if preservation update -->
        <!-- then show button to go to old tool-->
        {#if $dmdTasksStore[dmdTask.id].shouldUpdateInPreservation}
          <a
            class="finish-preservation"
            href="https://admin.canadiana.ca/packaging "
            target="_blank"
          >
            <button class="primary">
              <span class="auto-align auto-align__a-center">
                <span class="icon"><IoMdOpen /></span>
                Finish Preservation Update
              </span>
            </button>
          </a>
        {/if}
      {:else}
        <DmdSuccessItemUpdater dmdTaskId={dmdTask.id} bind:depositor />
      {/if}

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
  .finish-preservation {
    margin-left: 1rem;
  }
</style>
