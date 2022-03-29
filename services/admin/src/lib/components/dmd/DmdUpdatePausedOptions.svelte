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
  import { showConfirmation } from "$lib/utils/confirmation";

  /**
   *  @type { DMDTask } The DMDTask being processed.
   */
  export let dmdTask: DMDTask;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let sendingStoreRequest: boolean = false;

  async function handlePausePressed() {
    sendingStoreRequest = true;
    await showConfirmation(
      async () => {
        try {
          await $session.lapin.mutation("dmdTask.unpauseStorage", {
            id: dmdTask.id,
            user: $session.user,
          });
          window.location.reload();
          return {
            success: true,
          };
        } catch (e) {
          return {
            success: false,
            details: e?.message,
          };
        }
      },
      "",
      "Error: failed to unpause storage.",
      true
    );
  }
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <NotificationBar
    status="secondary"
    message="Press the 'Resume Metadata Storing' button to continue storing the metadata for your items."
  />
  <!--p>Review Metadata</p-->
  <br />

  <div>
    <LoadingButton
      buttonClass="primary"
      on:clicked={handlePausePressed}
      showLoader={sendingStoreRequest}
    >
      <span slot="content">Resume Metadata Storing</span>
    </LoadingButton>
  </div>
{/if}

<style>
  div {
    margin-bottom: 1rem;
  }
</style>
