<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import DmdDepositorSelector from "$lib/components/dmd/DmdDepositorSelector.svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let depositor = {
    string: "oocihm",
    label: "Canadiana.org",
  };

  let activeStepIndex = 0;

  let hasLookupRan = false;
  let showLookupLoader = false;
  let showLookupResults = false;

  let lookupResults = {};

  let shouldUpdateInAccess = true;
  let shouldUpdateInPreservation = true;

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
        id: "8_06941_1",
        label: "volume 1",
        output: "marc",
        parsed: true,
      },
    ],
  };

  async function handleLookupPressed() {
    activeStepIndex = 0;
    lookupResults = {};
    showLookupLoader = true;
    showLookupResults = false;
    //slug.resolveMany

    const response = await $session.lapin.query(
      "slug.resolveMany",
      dmdTask.items.map((item) => `${depositor.string}.${item.id}`)
    );
    if (response) {
      console.log(response);
      lookupResults["access"] = response;
      lookupResults["preservation"] = {};
      activeStepIndex = 1;
      hasLookupRan = true;
      showLookupLoader = false;
      showLookupResults = true;
      //console.log("lookupList", lookupList);
    } else {
      //error = response.toString();
    }
  }

  $: {
    depositor;
    showLookupResults = false;
    activeStepIndex = 0;
  }
</script>

<div class="metadata-form">
  <ScrollStepper
    bind:activeStepIndex
    displayPrevious={true}
    enableAutoScrolling={false}
  >
    <ScrollStepperStep
      title={`Select an access platform and look-up items${
        hasLookupRan ? " again" : ""
      }`}
    >
      <div slot="icon">1</div>

      <div
        class="look-up-wrap auto-align auto-align__a-center auto-align__j-between "
      >
        <div class="depositor-select-wrap">
          <DmdDepositorSelector bind:depositor />
        </div>

        {#if depositor?.string?.length}
          <button
            class="lookup-button primary"
            class:secondary={activeStepIndex === 1}
            on:click={handleLookupPressed}
          >
            <span
              class="auto-align auto-align__a-center"
              class:loading-button={showLookupLoader}
            >
              {#if showLookupLoader}
                <Loading size="sm" />
              {/if}
              <span class="text"
                >{!showLookupLoader
                  ? hasLookupRan
                    ? "Look-up Again"
                    : "Look-up"
                  : "Looking-up..."}</span
              >
            </span>
          </button>
        {/if}
      </div>
    </ScrollStepperStep>
    <ScrollStepperStep
      title={`Update descriptive metadata for items found`}
      isLastStep={true}
    >
      <div slot="icon">2</div>
      {#if !showLookupLoader}
        <div
          class="update-wrap auto-align auto-align__a-center auto-align__j-between "
        >
          <span>
            <input
              name="access"
              type="checkbox"
              bind:checked={shouldUpdateInAccess}
            />
            <label for="access">in {depositor["label"]}</label>
          </span>
          <span>
            <input
              name="preservation"
              type="checkbox"
              bind:checked={shouldUpdateInPreservation}
            />
            <label for="preservation">in Preservation</label>
          </span>
          {#if shouldUpdateInAccess || shouldUpdateInPreservation}
            <button class="primary">Update Descriptive Metadata Records</button>
          {/if}
        </div>
      {/if}
    </ScrollStepperStep>
  </ScrollStepper>
</div>

<div class="metadata-table">
  <DmdItemsTable
    bind:dmdTask
    bind:lookupResults
    bind:depositor
    showAccessColumn={shouldUpdateInAccess && showLookupResults}
    showPreservationColumn={shouldUpdateInPreservation && showLookupResults}
  />
</div>

<style>
  .look-up-wrap,
  .update-wrap {
    width: 100%;
  }
  .depositor-select-wrap {
    flex: 8;
    margin-right: 1rem;
  }
  .lookup-button {
    flex: 2;
  }
  .loading-button .text {
    margin-left: var(--margin-sm);
  }
</style>
