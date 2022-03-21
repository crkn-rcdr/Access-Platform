<!--
@component
### Overview
This component allows the user to update the dmd tasks items in an access platform and/or in preservation. 
### Properties
|    |    |    |
| -- | -- | -- |
| depositor: Depositor | required | The access platform to look for the items in. |
| dmdTask: ParsedDmdTask | required | The DMDTask being processed. |
### Usage
```
<DmdItemUpdater
  dmdTask={dmdTask}
  bind:depositor
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import type { Depositor } from "$lib/types";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import type { DMDTask, ShortTaskType } from "@crkn-rcdr/access-data";
  import Loading from "../shared/Loading.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import LoadingButton from "../shared/LoadingButton.svelte";
  import ScrollStepper from "../shared/ScrollStepper.svelte";
  import ScrollStepperStep from "../shared/ScrollStepperStep.svelte";
  import DmdItemsTable from "./DmdItemsTable.svelte";
  import { onMount } from "svelte";

  /**
   *  @type { DMDTask } The DMDTask being processed.
   */
  export let dmdTask: DMDTask;
  export let type: ShortTaskType;
  export let totalItems: number = 0;
  export let totalPages: number = 0;

  /**
   *  @type { Depositor } The access platform to look for the items in.
   */
  let depositor: Depositor;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let disabled: boolean = true;
  let destination: "access" | "preservation";
  let settingDestination: boolean = false;
  let lookingUp: boolean = false;
  let settingItemIds: boolean = false;
  let sendingStoreRequest: boolean = false;
  let activeStepIndex = 0;
  let currentPage = 1;

  async function handleUpdatePressed() {
    sendingStoreRequest = true;
    /*const result = await $session.lapin.mutation("dmdTask.store", {
      task: dmdTask.id,
      user: $session.user,
    });
    if (result) window.location.reload();*/
  }

  async function onDestinationChange(event) {
    destination = event.currentTarget.value;
    settingDestination = true;
    dmdTask["destination"] = destination;
    await $session.lapin.mutation("dmdTask.setDestination", {
      id: dmdTask.id,
      destination,
      user: $session.user,
    });
    settingDestination = false;
    activeStepIndex = 1;
  }

  async function lookupItems() {
    lookingUp = true;

    try {
      const pageData = await $session.lapin.mutation(`dmdTask.bulkLookup`, {
        id: dmdTask.id,
        destination,
        prefix: depositor.prefix,
        returnPage: currentPage,
        user: $session.user,
      });

      dmdTask["items"] = pageData.list;
    } catch (e) {
      console.log(e?.message);
      /*error = e?.message.includes(`"path:"`)
          ? "Code 8. Please contact the platform team for assistance."
          : "Code 9. Please contact the platform team for assistance. ";*/
    }

    dmdTask = dmdTask;
    lookingUp = false;
    activeStepIndex = 2;
  }

  async function handleDepositorChanged(e) {
    depositor = e.detail;
    if (destination) await lookupItems();
  }

  /*onMount(() => {
    if (dmdTask["destination"]) activeStepIndex = 1;
    if (dmdTask["items"]?.length && "found" in dmdTask["items"][0])
      activeStepIndex = 2;
  });*/
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <br />
  <div class="auto-align">
    <br />
    <div style="flex:1; margin-right: 1rem;">
      <ScrollStepper enableAutoScrolling={false} bind:activeStepIndex>
        <ScrollStepperStep title="Select Destination">
          <div slot="icon">1</div>
          <div class="auto-align auto-align__column">
            <span>
              <input
                disabled={settingItemIds}
                checked={destination === "access"}
                on:change={onDestinationChange}
                type="radio"
                name="amount"
                value="access"
              />
              Load into Access
            </span>
            <span>
              <input
                disabled={settingItemIds}
                checked={destination === "preservation"}
                on:change={onDestinationChange}
                type="radio"
                name="amount"
                value="preservation"
              />
              Load into OAIS Packaging Database
            </span>
            {#if settingDestination}
              <span>
                <Loading size="sm" backgroundType="gradient" />
              </span>
            {/if}
          </div>
        </ScrollStepperStep>
        <ScrollStepperStep title="Lookup Items">
          <div slot="icon">2</div>
          <div class="auto-align auto-align__column">
            <PrefixSelector
              {depositor}
              on:depositorSelected={handleDepositorChanged}
            />
            {#if lookingUp}
              <Loading size="sm" backgroundType="gradient" />
            {/if}
          </div>
        </ScrollStepperStep>
        <ScrollStepperStep title="Review Metadata">
          <div slot="icon">3</div>
          <div class="auto-align auto-align__column">
            <button class="primary" on:click={() => (activeStepIndex = 3)}>
              Looks Good!
            </button>
          </div>
        </ScrollStepperStep>
        <ScrollStepperStep isLastStep={true} title="Load Metadata">
          <div slot="icon">4</div>
          <div class="auto-align auto-align__column">
            <span>
              <LoadingButton
                buttonClass="primary"
                on:clicked={handleUpdatePressed}
                showLoader={sendingStoreRequest}
              >
                <!--{disabled}-->
                <span slot="content"> Load Metadata </span>
              </LoadingButton>
            </span>
          </div>
        </ScrollStepperStep>
      </ScrollStepper>
    </div>

    <div style="flex:3;">
      <DmdItemsTable
        bind:dmdTask
        bind:type
        bind:totalItems
        bind:totalPages
        bind:currentPage
      />
    </div>
  </div>
{/if}

<style>
  .auto-align {
    width: 100%;
  }
  .auto-align > * {
    /**:not(:first-child)*/
    margin-top: 1rem;
  }
  span:first-child {
    margin-right: var(--margin-sm);
  }
</style>
