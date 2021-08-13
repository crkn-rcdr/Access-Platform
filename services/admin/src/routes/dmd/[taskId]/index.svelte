<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      if (page.params["taskId"]) {
        const response = await context.lapin.query(
          "dmdTask.get",
          page.params["taskId"]
        );
        const dmdTask = DMDTask.parse(response);
        return { props: { dmdTask } };
      }
      return { props: {} };
    } catch (e) {
      return e;
    }
  };
</script>

<script lang="ts">
  /**
   * @file
   * @description This page displays the various states of and information about a dmdtask
   */
  //import { getStores } from "$app/stores";
  //import type { Session } from "$lib/types";
  import {
    //WaitingDMDTask,
    //FailedDMDTask,
    //SucceededDMDTask,
    DMDTask,
  } from "@crkn-rcdr/access-data";
  import DmdSplitWaitingViewer from "$lib/components/dmd/DmdSplitWaitingViewer.svelte";
  import DmdSplitFailureViewer from "$lib/components/dmd/DmdSplitFailureViewer.svelte";
  import DmdSplitSuccessStoreForm from "$lib/components/dmd/DmdSplitSuccessStoreForm.svelte";

  /**
   * @type {DMDTask} The dmdtask being displayed by the page.
   */
  export let dmdTask: DMDTask; //WaitingDMDTask | FailedDMDTask | SucceededDMDTask;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  //const { session } = getStores<Session>();

  /* TODO: Later grab from backend. */
  /* = {
    id: "123",
    updated: "1628785112",
    attachments: {
      // ...metadata file info
    },
    user: $session.user, //for now
    mdType: "marcooe",
    process: {
      requestDate: "1628785101",
      //succeeded: false,
      //message: "The process.message from the backend",
    },
    //items: [{}],
  };*/
</script>

<div class="dmd-task-page-wrap">
  {#if !dmdTask}
    Loading...
  {:else if !dmdTask?.["process"] || !("succeeded" in dmdTask?.["process"])}
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
