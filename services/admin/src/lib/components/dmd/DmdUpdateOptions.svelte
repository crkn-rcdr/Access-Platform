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
  import type { ParsedDMDTask } from "@crkn-rcdr/access-data";

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTask: ParsedDMDTask;
  export let lookupResultsMap = {};

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

  /**
   * Passes on the work of updating the metadata of the items in the task to the dmdTasksStore
   * @returns void
   */
  async function handleUpdatePressed() {
    // save item info, call proccess on dmdtask
    // should update item ids
    // destination
    const result = await $session.lapin.mutation("dmdTask.store", {
      task: dmdTask.id,
      destination,
      items: dmdTask.items
        .filter((item) => item.shouldStore)
        .map((item) => item.id),
      user: $session.user,
    });
    if (result) window.location.reload();
  }

  $: {
    let numItems = 0;
    for (const item of dmdTask.items) {
      if (item.shouldStore) numItems++;
    }
    disabled =
      depositor === null ||
      numItems === 0 ||
      !(destination === "access" || destination === "preservation");
  }

  function setDestinationForItems() {
    for (let item of dmdTask.items) {
      item.destination = destination;
    }
  }

  function onChange(event) {
    destination = event.currentTarget.value;
    setDestinationForItems();
  }

  /**
   * Whenever a prefix is changed, do a bulk lookup and change the "id" column to show the new ID. I suggest something like "green" for found and "red" for not found, with the checkbox set accordingly. This makes it nice and visible for users as they change the prefix. Avoid ZOD messages entirely for anything relating to IDs as all you care about is if they exist in the appropriate database or not (ZOD errors probably should never be shown to non-developers, as it's debugging output).
   */

  function chunkArray(array: any[], n: number) {
    if (!array || !n) return array;

    let length = array.length;
    let slicePoint = 0;
    let ret = [];

    while (slicePoint < length) {
      ret.push(array.slice(slicePoint, slicePoint + n));
      slicePoint += n;
    }
    return ret;
  }

  function setItemIds() {
    for (let item of dmdTask.items) {
      item.id = `${depositor.prefix !== "none" ? depositor.prefix + "." : ""}${
        item.id
      }`;
    }
    dmdTask = dmdTask;
  }

  async function lookupItems() {
    // Only grab and update 100 items, max, at a time
    const chunks = chunkArray(dmdTask.items, 1000);
    console.log("look at me");
    // Loop through the max 100 item long lists
    for (const chunk of chunks) {
      const slugBatch = chunk.map((item) => item.id);
      try {
        const response = await $session.lapin.mutation(
          `slug.resolveMany`,
          slugBatch
        );
        for (const result of response) {
          if (result.length === 2) {
            const slug = result[0];
            const info = result[1];
            lookupResultsMap[slug] = info.found;
          }
        }
      } catch (e) {
        console.log(e?.message);
        for (let id of slugBatch) lookupResultsMap[id] = false;
        /*error = e?.message.includes(`"path:"`)
          ? "Code 8. Please contact the platform team for assistance."
          : "Code 9. Please contact the platform team for assistance. ";*/
      }
    }
  }

  async function handleDepositorChanged(e) {
    depositor = e.detail;
    setItemIds();
    await lookupItems();
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
    <PrefixSelector {depositor} on:depositorSelected={handleDepositorChanged} />
    <label>
      <input
        checked={destination === "access"}
        on:change={onChange}
        type="radio"
        name="amount"
        value="access"
      /> Load into New Access
    </label>
    <label>
      <input
        checked={destination === "preservation"}
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
