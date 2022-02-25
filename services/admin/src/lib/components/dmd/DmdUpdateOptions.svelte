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
  import type { Session } from "$lib/types";
  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import type { ParsedDMDTask } from "@crkn-rcdr/access-data";
  /**
   *  @type { Depositor } The access platform to look for the items in.
   */
  export let depositor: Depositor = {
    prefix: "oocihm",
    label: "Canadiana.org",
  };

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTask: ParsedDMDTask;

  let disabled: boolean = true;
  let updatingIn: "access" | "preservation";

  /**
   * Passes on the work of updating the metadata of the items in the task to the dmdTasksStore
   * @returns void
   */
  async function handleUpdatePressed() {
    // save item info, call proccess on dmdtask
  }

  $: {
    let numItems = 0;
    for (const item of dmdTask.items) {
      if (item.shouldStore) numItems++;
    }
    disabled =
      depositor === null ||
      numItems === 0 ||
      !(updatingIn === "access" || updatingIn === "preservation");
  }

  function setDestinationForItems() {
    for (let item of dmdTask.items) {
      item.destination = updatingIn;
    }
  }

  function onChange(event) {
    updatingIn = event.currentTarget.value;
    setDestinationForItems();
  }
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <p>
    Please take a moment to preview the metadata for each item in the table.
    Then, if your metadata file does not already include prefixes on the ids,
    select a prefix option and choose where to load the metadata to. Then,
    select either access or preservation as the destination for the metadata
    update. This will activate the 'Process Metadata File' button. You can use
    the checkboxes in the table to control which items the metadata will be
    applied to when pressing the button.
  </p>
  <br />

  <div
    class="update-wrap auto-align auto-align__a-center auto-align__j-between"
  >
    <PrefixSelector bind:depositor />
    <label>
      <input
        checked={updatingIn === "access"}
        on:change={onChange}
        type="radio"
        name="amount"
        value="access"
      /> Load into New Access
    </label>
    <label>
      <input
        checked={updatingIn === "preservation"}
        on:change={onChange}
        type="radio"
        name="amount"
        value="preservation"
      /> Load for Saving to Preservation
    </label>
    <button class="primary" {disabled} on:click={handleUpdatePressed}>
      Load Metadata
    </button>
    <!--"Try Processing Metadata File Again"-->
  </div>

  <br /><br />
{/if}

<style>
  .update-wrap {
    width: 100%;
  }
  .update-wrap > *:not(:first-child) {
    margin-left: 1rem;
  }
  :global(.update-wrap span:first-child) {
    flex: 2;
  }
  :global(.update-wrap > div) {
    flex: 3;
  }
  label:first-child {
    margin-right: var(--margin-sm);
  }
</style>
