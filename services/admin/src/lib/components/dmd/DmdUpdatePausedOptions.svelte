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
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import LoadingButton from "../shared/LoadingButton.svelte";

  /**
   *  @type { DMDTask } The DMDTask being processed.
   */
  export let dmdTask: DMDTask;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let disabled: boolean = true;
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
      destination: dmdTask["destination"],
      prefix: "none",
      items: dmdTask["items"]
        .filter((item) => item.shouldStore)
        .map((item) => item.id),
      user: $session.user,
    });
    if (result) window.location.reload();
  }

  $: {
    let numItems = 0;
    for (const item of dmdTask["items"]) {
      if (item.shouldStore) numItems++;
    }
    disabled = numItems === 0;
  }
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <NotificationBar
    status="secondary"
    message="Press the 'Resume Metadata Store' button to continue storing the metadata for your items."
  />
  <!--p>Review Metadata</p-->
  <br />

  <div>
    <LoadingButton
      buttonClass="primary"
      on:clicked={handleUpdatePressed}
      showLoader={sendingStoreRequest}
      {disabled}
    >
      <span slot="content">Resume Metadata Store</span>
    </LoadingButton>
  </div>
{/if}

<style>
  div {
    margin-bottom: 1rem;
  }
</style>
