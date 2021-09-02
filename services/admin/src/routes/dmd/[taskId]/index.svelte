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
          "dmdTask.find",
          page.params["taskId"]
        );
        if (response && "result" in response)
          return { props: { dmdTask: response.result } };
        else return { props: {} };
      }
      return { props: {} };
    } catch (e) {
      return { props: { error: e } };
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

  export let error: any;
</script>

<div class="dmd-task-page-wrap">
  {#if error}
    {error?.message}
  {:else if !dmdTask}
    Loading...
  {:else if isSucceededDMDTask(dmdTask)}
    <DmdSplitSuccessView {dmdTask} />
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
