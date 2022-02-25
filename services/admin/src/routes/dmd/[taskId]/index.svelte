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
        if (response) return { props: { dmdTask: response } };
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
    isParsedDMDTask,
    isParsingDMDTask,
    isUpdateFailedDMDTask,
    isUpdateSucceededDMDTask,
    isUpdatingDMDTask,
  } from "@crkn-rcdr/access-data";
  import DmdWaitingView from "$lib/components/dmd/old/DmdWaitingView.svelte";
  import DmdFailureView from "$lib/components/dmd/old/DmdFailureView.svelte";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import DmdUpdateSuccessOptions from "$lib/components/dmd/DmdUpdateSuccessOptions.svelte";
  import DmdUpdateOptions from "$lib/components/dmd/DmdUpdateOptions.svelte";
  import DmdUpdateProgress from "$lib/components/dmd/DmdUpdateProgress.svelte";
  import DmdUpdateFailedOptions from "$lib/components/dmd/DmdUpdateFailedOptions.svelte";

  /**
   * @type {DMDTask} The dmdtask being displayed by the page.
   */
  export let dmdTask: DMDTask; //ParsingDMDTask | UpdateFailedDMDTask | UpdateSucceededDMDTask;

  export let error: any;
</script>

<div class="dmd-task-page-wrap">
  {#if error}
    {error?.message}
  {:else if !dmdTask}
    Loading...
  {:else if isUpdateSucceededDMDTask(dmdTask)}
    <DmdUpdateSuccessOptions />
    <DmdItemsTable {dmdTask} />
  {:else if isParsedDMDTask(dmdTask)}
    <DmdUpdateOptions />
    <DmdItemsTable {dmdTask} />
  {:else if isUpdatingDMDTask(dmdTask)}
    <DmdUpdateProgress />
    <DmdItemsTable {dmdTask} />
  {:else if isUpdateFailedDMDTask(dmdTask)}
    <DmdUpdateFailedOptions />
    <DmdFailureView {dmdTask} message={dmdTask.process.message} />
    <DmdItemsTable {dmdTask} />
  {:else if isParsingDMDTask(dmdTask)}
    <DmdWaitingView bind:dmdTask />
  {:else}
    <DmdFailureView message="Something went wrong." />
  {/if}
</div>

<style>
  :global(.dmd-task-page-wrap .failure .notification-bar) {
    width: 30rem;
  }
</style>
