<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
</script>

<script lang="ts">
  /**
   * @file
   * @description This page displays the various states of and information about a dmdtask
   */
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import type {
    WaitingDMDTask,
    FailedDMDTask,
    SucceededDMDTask,
  } from "@crkn-rcdr/access-data";
  import DmdSplitWaitingViewer from "$lib/components/dmd/DmdSplitWaitingViewer.svelte";
  import DmdSplitFailureViewer from "$lib/components/dmd/DmdSplitFailureViewer.svelte";
  import DmdSplitSuccessStoreForm from "$lib/components/dmd/DmdSplitSuccessStoreForm.svelte";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /* TODO: Later grab from backend. */
  /**
   * @type {WaitingDMDTask | FailedDMDTask | SucceededDMDTask} The dmdtask being displayed by the page.
   */
  const dmdTask: WaitingDMDTask | FailedDMDTask | SucceededDMDTask = {
    id: "123",
    updated: "1628785112",
    attachments: {
      // ...metadata file info
    },
    user: $session.user, //for now
    mdType: "marcooe",
    process: {
      requestDate: "1628785101",
      //succeeded: true,
      //message: "Bippidy Boppidy Boop",
    },
    //items: [{}],
  };
</script>

<div class="dmd-task-page-wrap">
  {#if !("succeeded" in dmdTask?.["process"])}
    <DmdSplitWaitingViewer {dmdTask} />
  {:else if !dmdTask?.["process"]?.["succeeded"]}
    <DmdSplitFailureViewer
      {dmdTask}
      message={dmdTask?.["process"]?.["message"]}
    />
  {:else if dmdTask?.["items"]?.length}
    <DmdSplitSuccessStoreForm />
  {:else}
    <!--JUUUST In Case-->
    <DmdSplitFailureViewer
      {dmdTask}
      message="No objects were split from the metadata file."
    />
  {/if}
</div>

<style>
  :global(.dmd-task-page-wrap h6) {
    text-align: center;
    font-weight: bold;
  }
  :global(.dmd-task-page-wrap .notification-bar) {
    width: 30rem;
  }
</style>
