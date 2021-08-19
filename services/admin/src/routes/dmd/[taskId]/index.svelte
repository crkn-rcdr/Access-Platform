<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      if (page?.params?.["taskId"]) {
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
    DMDTask,
    isWaitingDMDTask,
    isFailedDMDTask,
    isSucceededDMDTask,
  } from "@crkn-rcdr/access-data";
  import DmdSplitWaitingView from "$lib/components/dmd/DmdSplitWaitingView.svelte";
  import DmdSplitFailureView from "$lib/components/dmd/DmdSplitFailureView.svelte";
  import DmdSplitSuccessView from "$lib/components/dmd/DmdSplitSuccessView.svelte";

  /**
   * @type {DMDTask} The dmdtask being displayed by the page.
   */
  export let dmdTask: DMDTask; //WaitingDMDTask | FailedDMDTask | SucceededDMDTask;
</script>

<div class="dmd-task-page-wrap">
  {#if !dmdTask}
    <!--Loading...-->
    <DmdSplitSuccessView />
  {:else if isSucceededDMDTask(dmdTask)}
    <DmdSplitSuccessView /> <!--dmdTask={getAsSucceededTask()} -->
  {:else if isFailedDMDTask(dmdTask)}
    <DmdSplitFailureView {dmdTask} message={dmdTask.process["message"]} />
  {:else if isWaitingDMDTask(dmdTask)}
    <DmdSplitWaitingView {dmdTask} />
  {:else}
    <!--JUST In Case All Else Fails-->
    <DmdSplitFailureView
      message="No objects were split from the metadata file."
    />
  {/if}
</div>

<style>
  :global(.dmd-task-page-wrap .failure .notification-bar) {
    width: 30rem;
  }
</style>
