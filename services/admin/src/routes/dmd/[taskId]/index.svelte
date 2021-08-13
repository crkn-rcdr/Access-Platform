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
  import {
    WaitingDMDTask,
    FailedDMDTask,
    SucceededDMDTask,
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
   * Casts @var dmdTask to type WaitingDMDTask for use in components that expect a WaitingDMDTask
   * @returns void
   */
  function getAsWaitingTask(): WaitingDMDTask {
    return <WaitingDMDTask>dmdTask;
  }

  /**
   * Casts @var dmdTask to type FailedDMDTask for use in components that expect a FailedDMDTask
   * @returns void
   */
  function getAsFailedTask(): FailedDMDTask {
    return <FailedDMDTask>dmdTask;
  }

  /**
   * Casts @var dmdTask to type SucceededDMDTask for use in components that expect a SucceededDMDTask
   * @returns void
   */
  function getAsSucceededTask(): SucceededDMDTask {
    return <SucceededDMDTask>dmdTask;
  }
</script>

<div class="dmd-task-page-wrap">
  {#if !dmdTask}
    Loading...
  {:else if !dmdTask?.["process"] || !("succeeded" in dmdTask?.["process"])}
    <DmdSplitWaitingViewer dmdTask={getAsWaitingTask()} />
  {:else if !dmdTask?.["process"]?.["succeeded"]}
    <DmdSplitFailureViewer
      dmdTask={getAsFailedTask()}
      message={dmdTask?.["process"]?.["message"]}
    />
  {:else if dmdTask?.["items"]?.length}
    <DmdSplitSuccessStoreForm /> <!--dmdTask={getAsSucceededTask()} -->
  {:else}
    <!--JUST In Case All Else Fails-->
    <DmdSplitFailureViewer
      dmdTask={getAsFailedTask()}
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
