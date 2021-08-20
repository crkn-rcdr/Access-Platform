<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import type {
    AccessPlatform,
    DmdLoadedParseRecord,
    DmdUpdatedParseRecord,
  } from "$lib/types";
  import ProgressBar from "$lib/components/shared/ProgressBar.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import DmdItemLookup from "$lib/components/dmd/DmdItemLookup.svelte";
  import DmdItemUpdater from "$lib/components/dmd/DmdItemUpdater.svelte";

  /**
   * TODO: Delete test data
   * @type { SucceededDMDTask } The dmd task being displayed
   */
  export let dmdTask: SucceededDMDTask = {
    id: "123",
    updated: "1628785112",
    attachments: {
      metadata: {
        content_type: "application/json",
        revpos: 2,
        digest: "md5-QpoRn3RBQEAl8wBet0RVmw==",
        length: 646,
        stub: true,
      },
    },
    user: {
      email: "lapierre@crkn.ca",
      name: "Brittny Lapierre",
    },
    format: "marcooe",
    process: {
      requestDate: "1628785101",
      processDate: "1628785101",
      succeeded: true,
      message: "The process.message from the backend",
    },
    items: [
      {
        message: `{"test":"json"}`,
        id: "8_06941",
        label: "collection",
        output: "marc",
        parsed: true,
      },
      {
        message: `{"test":"json"}`,
        id: "8_06941_1",
        label: "volume 1",
        output: "marc",
        parsed: true,
      },
      {
        message: `{"test":"json"}`,
        id: "8_06941_2",
        label: "volume 2",
        output: "marc",
        parsed: true,
      },
    ],
  };

  /**
   * @type { number } The control for the stepper that lets the user either lookup or update the items in the @var dmdTask
   */
  let activeStepIndex = 0;

  /**
   * @type {"ready" | "loading" | "loaded" | "error"} This vaiable keeps track of the state of the lookup component, to show relevant messages to the user.
   */
  let lookupState: "ready" | "loading" | "loaded" | "error" = "ready";

  /**
   * @type {"ready" | "updating" | "updated" | "error"} This vaiable keeps track of the state of the updater component, to show relevant messages to the user.
   */
  let updateState: "ready" | "updating" | "updated" | "error" = "ready";

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  let accessPlatform: AccessPlatform = {
    prefix: "oocihm",
    label: "Canadiana.org",
  };

  /**
   *  @type { string } The @var AccessPlatform.prefix tracker used to tell if the user has selected a new access platform. The items table is refreshed using @function handleAccessPlatformChanged if this is the case.
   */
  let prevAccessPlatformPrefix = accessPlatform.prefix;

  /**
   *  @type { (
    | DmdLoadedParseRecord
    | DmdUpdatedParseRecord
  )[] } The dmdtask items lookup and update results. Indexing exactly matches the @var dmdTask.items
   */
  let itemsLookupAndUpdateResults: (
    | DmdLoadedParseRecord
    | DmdUpdatedParseRecord
  )[] = [];

  /**
   * @type { boolean } If the request to update should be sent to the selected access platform. The value depends on user selections in child components. It has affect on what should be displayed in the table.
   */
  let shouldUpdateInAccess: boolean = true;

  /**
   * @type { boolean } If the request to update should be sent to preservation. The value depends on user selections in child components. It has affect on what should be displayed in the table.
   */
  let shouldUpdateInPreservation: boolean = true;

  /**
   * @type { boolean } If the access lookup column should be displayed of not. The displaying of the column depends on user selections in child components.
   */
  let showAccessLookupColumn: boolean = false;

  /**
   * @type { boolean } If the preservation lookup column should be displayed of not. The displaying of the column depends on user selections in child components.
   */
  let showPreservationLookupColumn: boolean = false;

  /**
   * @type { boolean } If the access update column should be displayed of not. The displaying of the column depends on user selections in child components.
   */
  let showAccessUpdateColumn: boolean = false;

  /**
   * @type { boolean } If the preservation update column should be displayed of not. The displaying of the column depends on user selections in child components.
   */
  let showPreservationUpdateColumn: boolean = false;

  /**
   * @type { number } The completion percentage of the updating process. Used to show a progress bar to the user. The value is set in a child component.
   */
  let updatedProgressPercentage = 0;

  /**
   * A helper method to determine if the user has selected a new @var accessPlatform.
   * @returns void
   */
  function checkAccessPlatformChanged() {
    const changed = prevAccessPlatformPrefix !== accessPlatform["prefix"];
    if (changed) prevAccessPlatformPrefix = accessPlatform["prefix"];
    return changed;
  }

  /**
   * Resets the state of the table and stepper
   * @returns void
   */
  function handleAccessPlatformChanged() {
    lookupState = "ready";
    showAccessLookupColumn = false;
    showPreservationLookupColumn = false;
    showAccessUpdateColumn = false;
    showPreservationUpdateColumn = false;
  }

  /**
   * @listens accessPlatform
   * @description if the user has selected a new @var accessPlatform, reset the state of the table and stepper
   */
  $: {
    accessPlatform;
    if (checkAccessPlatformChanged()) {
      handleAccessPlatformChanged();
    }
  }

  /**
   * @listens lookupState
   * @description When the lookup state changes to anything but loaded, set the stepper to show the lookup step only.
   */
  $: {
    if (lookupState === "loaded") activeStepIndex = 1;
    else activeStepIndex = 0;
  }

  /**
   * @listens shouldUpdateInAccess
   * @listens lookupState
   * @description Toggles the visibility of the access lookup column in the items table depending on user selections and interaction
   */
  $: showAccessLookupColumn = shouldUpdateInAccess && lookupState === "loaded";

  /**
   * @listens shouldUpdateInPreservation
   * @listens lookupState
   * @description Toggles the visibility of the preservation lookup column in the items table depending on user selections and interaction
   */
  $: showPreservationLookupColumn =
    shouldUpdateInPreservation && lookupState === "loaded";

  /**
   * @listens shouldUpdateInAccess
   * @listens updateState
   * @description Toggles the visibility of the access updated column in the items table depending on user selections and interaction
   */
  $: showAccessUpdateColumn =
    shouldUpdateInAccess &&
    (updateState === "updating" || updateState === "updated");

  /**
   * @listens shouldUpdateInPreservation
   * @listens updateState
   * @description Toggles the visibility of the preservation updated column in the items table depending on user selections and interaction
   */
  $: showPreservationUpdateColumn =
    shouldUpdateInPreservation &&
    (updateState === "updating" || updateState === "updated");
</script>

<div class="metadata-form" class:disabled={updateState === "updating"}>
  <ScrollStepper
    bind:activeStepIndex
    displayPrevious={true}
    enableAutoScrolling={false}
  >
    <ScrollStepperStep title="Select an access platform and look-up items">
      <div slot="icon">1</div>

      <DmdItemLookup
        bind:state={lookupState}
        bind:accessPlatform
        bind:itemsLookupAndUpdateResults
        itemsToLookup={dmdTask.items}
      />
    </ScrollStepperStep>
    <ScrollStepperStep
      title={`Update descriptive metadata for items found`}
      isLastStep={true}
    >
      <div slot="icon">2</div>
      {#if lookupState !== "loading"}
        <DmdItemUpdater
          dmdTaskId={dmdTask.id}
          bind:state={updateState}
          bind:accessPlatform
          bind:shouldUpdateInPreservation
          bind:shouldUpdateInAccess
          bind:itemsLookupAndUpdateResults
          bind:updatedProgressPercentage
        />
      {/if}
    </ScrollStepperStep>
  </ScrollStepper>
</div>

<div class="metadata-table">
  {#if updateState === "updating"}
    <ProgressBar
      progress={updatedProgressPercentage}
      progressText={updatedProgressPercentage === 100
        ? "updated!"
        : "updating items..."}
    />
    <br />
    <br />
  {/if}
  <DmdItemsTable
    bind:itemsToShow={dmdTask.items}
    bind:accessPlatform
    bind:itemsLookupAndUpdateResults
    bind:showAccessLookupColumn
    bind:showPreservationLookupColumn
    bind:showAccessUpdateColumn
    bind:showPreservationUpdateColumn
  />
</div>

<style>
  .disabled {
    opacity: 0.2;
    pointer-events: none;
  }
</style>
