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
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import Loading from "../shared/Loading.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import LoadingButton from "../shared/LoadingButton.svelte";
  import ScrollStepper from "../shared/ScrollStepper.svelte";
  import ScrollStepperStep from "../shared/ScrollStepperStep.svelte";

  /**
   *  @type { DMDTask } The DMDTask being processed.
   */
  export let dmdTask: DMDTask;
  export let notFoundIds;

  /**
   *  @type { Depositor } The access platform to look for the items in.
   */
  let depositor: Depositor;
  let prevPrefix: string;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let disabled: boolean = true;
  let destination: "access" | "preservation";
  let lookingUp: boolean = false;
  let settingItemIds: boolean = false;
  let sendingStoreRequest: boolean = false;

  /**
   * Passes on the work of updating the metadata of the items in the task to the dmdTasksStore
   * @returns void
   */
  async function handleUpdatePressed() {
    // save item info, call proccess on dmdtask
    // should update item ids
    // destination
    sendingStoreRequest = true;
    const result = await $session.lapin.mutation("dmdTask.store", {
      task: dmdTask.id,
      destination,
      prefix: depositor.prefix,
      items: dmdTask["items"]
        .filter((item) => item.shouldStore)
        .map((item) => item.id.replace(`${depositor.prefix}.`, "")),
      user: $session.user,
    });
    if (result) window.location.reload();
  }

  $: {
    let numItems = 0;
    for (const item of dmdTask["items"]) {
      if (item.shouldStore) numItems++;
    }
    disabled =
      depositor === null ||
      numItems === 0 ||
      !(destination === "access" || destination === "preservation");
  }

  function setDestinationForItems() {
    dmdTask["destination"] = destination;
  }

  async function onChange(event) {
    destination = event.currentTarget.value;
    setDestinationForItems();
    await lookupItems();
  }

  function setItemIds() {
    settingItemIds = true;
    for (let item of dmdTask["items"]) {
      item.id = `${depositor.prefix !== "none" ? depositor.prefix + "." : ""}${
        prevPrefix ? item.id.replace(`${prevPrefix}.`, "") : item.id
      }`;
    }
    settingItemIds = false;
  }

  async function lookupItems() {
    lookingUp = true;
    try {
      notFoundIds = await $session.lapin.mutation(`dmdTask.bulkLookup`, {
        id: dmdTask.id,
        destination,
        prefix: depositor.prefix,
      });
    } catch (e) {
      console.log(e?.message);
      /*error = e?.message.includes(`"path:"`)
          ? "Code 8. Please contact the platform team for assistance."
          : "Code 9. Please contact the platform team for assistance. ";*/
    }

    dmdTask = dmdTask;
    lookingUp = false;
  }

  async function handleDepositorChanged(e) {
    depositor = e.detail;
    //setItemIds();
    if (destination) await lookupItems();
    prevPrefix = depositor.prefix;
  }
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <NotificationBar
    status="secondary"
    message="To confirm the metadata looks correct, click the 'Preview Metadata' buttons in the table below. Then, fill out the form and press 'Load Metadata' to set each selected item's metadata."
  />
  <!--p>Review Metadata</p-->
  <br />

  <ScrollStepper>
    <ScrollStepperStep title="Select a Destination">
      <div slot="icon">1</div>
      <div class="auto-align auto-align__a-center auto-align__j-between">
        <span>
          {#if destination === "preservation" || !lookingUp}
            <input
              disabled={settingItemIds}
              checked={destination === "access"}
              on:change={onChange}
              type="radio"
              name="amount"
              value="access"
            />
          {/if}

          {#if destination === "access" && lookingUp}
            <Loading size="sm" backgroundType="gradient" />
          {/if}

          Load into Access
        </span>
        <span>
          {#if destination === "access" || !lookingUp}
            <input
              disabled={settingItemIds}
              checked={destination === "preservation"}
              on:change={onChange}
              type="radio"
              name="amount"
              value="preservation"
            />
          {/if}
          {#if destination === "preservation" && lookingUp}
            <Loading size="sm" backgroundType="gradient" />
          {/if}
          Load into OAIS Packaging Database
        </span>
      </div>
    </ScrollStepperStep>
    <ScrollStepperStep title="Lookup Items">
      <div slot="icon">2</div>
      <div class="auto-align auto-align__a-center auto-align__j-between">
        {#if settingItemIds}
          <Loading size="sm" backgroundType="gradient" />
        {/if}
        <PrefixSelector
          {depositor}
          on:depositorSelected={handleDepositorChanged}
        />
      </div>
    </ScrollStepperStep>
    <ScrollStepperStep title="Review Metadata">
      <div slot="icon">3</div>
      <div class="auto-align auto-align__a-center auto-align__j-between">
        <button class="primary">Looks Good!</button>
      </div>
    </ScrollStepperStep>
    <ScrollStepperStep title="Load Metadata">
      <div slot="icon">4</div>
      <div class="auto-align auto-align__a-center auto-align__j-between">
        <span>
          <LoadingButton
            buttonClass="primary"
            on:clicked={handleUpdatePressed}
            showLoader={sendingStoreRequest}
            {disabled}
          >
            <span slot="content"> Load Metadata </span>
          </LoadingButton>
        </span>
      </div>
    </ScrollStepperStep>
  </ScrollStepper>

  <br />
  <br />
{/if}

<style>
  .auto-align {
    width: 100%;
  }
  .auto-align > *:not(:first-child) {
    margin-left: 1rem;
  }
  span:first-child {
    margin-right: var(--margin-sm);
  }
</style>
