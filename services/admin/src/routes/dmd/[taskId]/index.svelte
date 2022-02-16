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
        else
          return {
            props: {
              error: {
                message: "DMD task not found",
              },
            },
          };
      }
      return { props: {} };
    } catch (e) {
      return {
        props: {
          error: "Code 15. Please contact the platform team for assistance.",
        },
      };
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
    isValidatingDMDTask,
    isFailedDMDTask,
    isSucceededDMDTask,
  } from "@crkn-rcdr/access-data";
  import DmdWaitingView from "$lib/components/dmd/DmdWaitingView.svelte";
  import DmdFailureView from "$lib/components/dmd/DmdFailureView.svelte";
  import DmdSuccessView from "$lib/components/dmd/success/DmdSuccessView.svelte";

  /**
   * @type {DMDTask} The dmdtask being displayed by the page.
   */
  export let dmdTask: DMDTask; //ValidatingDMDTask | FailedDMDTask | SucceededDMDTask;

  export let error: any;
</script>

<div class="dmd-task-page-wrap">
  {#if error}
    {error?.message}
  {:else if !dmdTask}
    Loading...
  {:else if isSucceededDMDTask(dmdTask)}
    <DmdSuccessView {dmdTask} />
  {:else if isFailedDMDTask(dmdTask)}
    <DmdFailureView {dmdTask} message={dmdTask.process.message} />
  {:else if isValidatingDMDTask(dmdTask)}
    <DmdWaitingView bind:dmdTask />
  {:else}
    <!--JUST In Case All Else Fails-->
    <DmdFailureView message="Something went wrong." />
  {/if}
</div>

<style>
  :global(.dmd-task-page-wrap .failure .notification-bar) {
    width: 30rem;
  }
</style>
