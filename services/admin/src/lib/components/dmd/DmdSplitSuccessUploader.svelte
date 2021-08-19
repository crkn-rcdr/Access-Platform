<script lang="ts">
  import type { SucceededDMDTask } from "@crkn-rcdr/access-data";
  import ScrollStepper from "$lib/components/shared/ScrollStepper.svelte";
  import ScrollStepperStep from "$lib/components/shared/ScrollStepperStep.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import DmdDepositorSelector from "$lib/components/dmd/DmdDepositorSelector.svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import ProgressBar from "../shared/ProgressBar.svelte";
  import LoadingButton from "../shared/LoadingButton.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";

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
  let lookupFailure = false;

  let lookupResults = {};

  let updateResults = {};
  let showUpdateProgress = false;
  let showUpdateResults = false;
  let updateAccessProgress = 0;

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

  function setStateToLookup() {
    showLookupResults = false;
    showUpdateProgress = false;
    showUpdateResults = false;
    updateAccessProgress = 0;
    activeStepIndex = 0;
  }

  function setStateToLookingUp() {
    activeStepIndex = 0;
    lookupResults = {};
    showLookupLoader = true;
    showLookupResults = false;
    showUpdateProgress = false;
    showUpdateResults = false;
  }

  function setStateToUpdate() {
    activeStepIndex = 1;
    hasLookupRan = true;
    showLookupResults = true;
  }

  function setStateToUpdating() {
    updateAccessProgress = 0;
    showUpdateResults = true;
    showUpdateProgress = false;
    updateResults["access"] = {};
    updateResults["preservation"] = {};
  }

  function setStateToUpdated() {
    showUpdateResults = true;
    showUpdateProgress = false;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function handleLookupPressed() {
    setStateToLookingUp();

    const response = await $session.lapin.query(
      "slug.resolveMany",
      dmdTask.items.map((item) => `${depositor.string}.${item.id}`)
    );
    if (response) {
      console.log(response);
      lookupResults["access"] = response;
      lookupResults["preservation"] = {}; // TODO: Ask how to implement this

      lookupFailure =
        Object.keys(lookupResults["access"]).filter(
          (key) => lookupResults["access"][key].found
        ).length +
          Object.keys(lookupResults["preservation"]).filter(
            (key) => lookupResults["preservation"][key].found
          ).length ===
        0;
      showLookupLoader = false;
      if (!lookupFailure) {
        await sleep(5000);
        setStateToUpdate();
      }
      //setStateToUploadEnabled();
    } else {
      //error = response.toString();
    }
  }

  async function handleUpdatePressed() {
    setStateToUpdating();

    let itemsFoundInAccess = Object.keys(lookupResults["access"])
      .filter((key) => lookupResults["access"][key].found)
      .map((slug) => {
        return {
          slug,
          id: lookupResults["access"][slug].result.id,
        };
      });

    if (itemsFoundInAccess.length > 0) {
      showUpdateProgress = true;
      let index = 0;
      for (const item of itemsFoundInAccess) {
        const response = await $session.lapin.mutation("dmdTask.storeAccess", {
          task: dmdTask.id, // dmdtask uuid
          index, // array index of item whose metadata is being stored
          slug: item["slug"], // prefix + id (we might not need this if we send the resolved noid)
          noid: item["id"], // result of slug lookup
        });
        if (response) {
          console.log(response);
          updateResults["access"][item["slug"]] = response;
          console.log(updateResults);
        } else {
          //error = response.toString();
        }
        updateAccessProgress = Math.round(
          (Object.keys(updateResults["access"]).length /
            itemsFoundInAccess.length) *
            100
        );

        index++;
        await sleep(1000);
      }
      setStateToUpdated();
    }
  }

  $: {
    depositor;
    setStateToLookup();
  }
</script>

<div class="metadata-form" class:disabled={showUpdateProgress}>
  <ScrollStepper
    bind:activeStepIndex
    displayPrevious={true}
    enableAutoScrolling={false}
  >
    <ScrollStepperStep title="Select an access platform and look-up items">
      <div slot="icon">1</div>

      <div
        class="look-up-wrap auto-align auto-align__a-center auto-align__j-between "
      >
        <div class="depositor-select-wrap">
          <DmdDepositorSelector bind:depositor />
        </div>

        {#if depositor?.string?.length}
          <LoadingButton
            buttonClass={`${activeStepIndex === 0 ? "primary" : "secondary"}`}
            showLoader={showLookupLoader}
            on:clicked={handleLookupPressed}
          >
            <span slot="content">
              {!showLookupLoader
                ? hasLookupRan
                  ? "Look-up Again"
                  : "Look-up"
                : "Looking-up..."}
            </span>
          </LoadingButton>
        {/if}
      </div>

      {#if lookupFailure}
        <NotificationBar
          message={`No items were found in ${depositor["label"]} or in Preservation. Please select another access platform, or <a href="/dmd/new">process a new metadata file</a> to try again.`}
          status="fail"
        />
      {/if}
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
            <button class="primary" on:click={handleUpdatePressed}>
              {showUpdateResults
                ? "Update Descriptive Metadata Records Again"
                : "Update Descriptive Metadata Records"}
            </button>
            <!--LoadingButton
              buttonClass="primary"
              showLoader={showUpdateProgress}
              on:clicked={handleUpdatePressed}
            >
              <span slot="content">
                {!showUpdateProgress
                  ? showUpdateResults
                    ? "Update Descriptive Metadata Records Again"
                    : "Update Descriptive Metadata Records"
                  : "Updating..."}
              </span>
            </LoadingButton-->
          {/if}
        </div>
      {/if}
    </ScrollStepperStep>
  </ScrollStepper>
</div>

<div class="metadata-table">
  {#if showUpdateProgress}
    <ProgressBar
      progress={updateAccessProgress}
      progressText={updateAccessProgress === 100
        ? "updated!"
        : "updating items..."}
    />
    <br />
    <br />
  {/if}

  <DmdItemsTable
    bind:dmdTask
    bind:depositor
    bind:lookupResults
    bind:updateResults
    showAccessLookupColumn={shouldUpdateInAccess && showLookupResults}
    showPreservationLookupColumn={shouldUpdateInPreservation &&
      showLookupResults}
    showAccessUpdateColumn={shouldUpdateInAccess && showUpdateResults}
    showPreservationUpdateColumn={shouldUpdateInPreservation &&
      showUpdateResults}
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
  .disabled {
    opacity: 0.2;
    pointer-events: none;
  }
</style>
