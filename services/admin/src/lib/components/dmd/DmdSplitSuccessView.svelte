<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import ProgressBar from "$lib/components/shared/ProgressBar.svelte";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import DmdItemLookup from "$lib/components/dmd/DmdItemLookup.svelte";
  import DmdItemUpdater from "$lib/components/dmd/DmdItemUpdater.svelte";

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
  let accessPlatform = {
    prefix: "oocihm",
    label: "Canadiana.org",
  };
  let activeStepIndex = 0;
  let lookupState: "ready" | "loading" | "loaded" | "error" = "ready";
  let updateState: "ready" | "updating" | "updated" | "error" = "ready";
  let shouldUpdateInPreservation: boolean = true;
  let shouldUpdateInAccess: boolean = true;
  let itemsResults = [];
  let prevAccessPlatformPrefix = accessPlatform.prefix;
  let showAccessLookupColumn = false;
  let showPreservationLookupColumn = false;
  let showAccessUpdateColumn = false;
  let showPreservationUpdateColumn = false;
  let updatedProgressPercentage = 0;

  $: showAccessLookupColumn = shouldUpdateInAccess && lookupState === "loaded";
  $: showPreservationLookupColumn =
    shouldUpdateInPreservation && lookupState === "loaded";
  $: showAccessUpdateColumn =
    shouldUpdateInAccess &&
    (updateState === "updating" || updateState === "updated");
  $: showPreservationUpdateColumn =
    shouldUpdateInPreservation &&
    (updateState === "updating" || updateState === "updated");

  function checkAccessPlatformChanged() {
    const changed = prevAccessPlatformPrefix !== accessPlatform["prefix"];
    if (changed) prevAccessPlatformPrefix = accessPlatform["prefix"];
    return changed;
  }

  function handleAccessPlatformChanged() {
    lookupState = "ready";
    showAccessLookupColumn = false;
    showPreservationLookupColumn = false;
    showAccessUpdateColumn = false;
    showPreservationUpdateColumn = false;
  }

  $: {
    accessPlatform;
    if (checkAccessPlatformChanged()) {
      handleAccessPlatformChanged();
    }
  }

  $: {
    if (lookupState === "loaded") activeStepIndex = 1;
    else activeStepIndex = 0;
  }
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
        bind:itemsResults
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
          bind:itemsResults
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
    bind:dmdTask
    bind:accessPlatform
    bind:itemsResults
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
