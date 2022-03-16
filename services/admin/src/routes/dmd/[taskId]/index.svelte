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
        const pageData = await context.lapin.query("dmdTask.page", {
          id: page.params["taskId"],
          page: 1,
          limit: 100,
        });

        if (response)
          return {
            props: {
              dmdTask: response,
              pageData,
            },
          };
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
    isParseSucceededDMDTask,
    isParseFailedDMDTask,
    isParsingDMDTask,
    isUpdateFailedDMDTask,
    isUpdateSucceededDMDTask,
    isUpdatingDMDTask,
    isUpdatePausedDMDTask,
  } from "@crkn-rcdr/access-data";
  import DmdItemsTable from "$lib/components/dmd/DmdItemsTable.svelte";
  import DmdUpdateSuccessOptions from "$lib/components/dmd/DmdUpdateSuccessOptions.svelte";
  import DmdUpdateOptions from "$lib/components/dmd/DmdUpdateOptions.svelte";
  import DmdUpdateProgress from "$lib/components/dmd/DmdUpdateProgress.svelte";
  import DmdUpdateFailedOptions from "$lib/components/dmd/DmdUpdateFailedOptions.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import DmdParseTracker from "$lib/components/dmd/DmdParseTracker.svelte";
  import DmdParseFailedOptions from "$lib/components/dmd/DmdParseFailedOptions.svelte";
  import DmdUpdatePausedOptions from "$lib/components/dmd/DmdUpdatePausedOptions.svelte";

  /**
   * @type {DMDTask} The dmdtask being displayed by the page.
   */
  export let dmdTask: DMDTask; //ParsingDMDTask | UpdateFailedDMDTask | UpdateSucceededDMDTask;

  export let pageData: any;

  export let lookupResultsMap = {};

  export let error: any;
</script>

<div class="dmd-task-page-wrap">
  {#if pageData}
    {JSON.stringify(pageData)}
  {:else}
    none
  {/if}

  {#if error}
    {error?.message}
  {:else if !dmdTask}
    Loading...
  {:else if isUpdatePausedDMDTask(dmdTask)}
    <DmdUpdatePausedOptions bind:dmdTask />
    <DmdItemsTable bind:dmdTask />
  {:else if isUpdateSucceededDMDTask(dmdTask)}
    <DmdUpdateSuccessOptions bind:dmdTask />
    <DmdItemsTable bind:dmdTask />
  {:else if isUpdateFailedDMDTask(dmdTask)}
    <DmdUpdateFailedOptions bind:dmdTask />
    <DmdItemsTable bind:dmdTask />
  {:else if isUpdatingDMDTask(dmdTask)}
    <DmdUpdateProgress bind:dmdTask />
    <DmdItemsTable bind:dmdTask />
  {:else if isParseSucceededDMDTask(dmdTask)}
    <DmdUpdateOptions bind:dmdTask bind:lookupResultsMap />
    <DmdItemsTable bind:dmdTask bind:lookupResultsMap />
  {:else if isParseFailedDMDTask(dmdTask)}
    <DmdParseFailedOptions bind:dmdTask />
  {:else if isParsingDMDTask(dmdTask)}
    <DmdParseTracker bind:dmdTask />
  {:else}
    <NotificationBar message="Something went wrong." status="fail" />
  {/if}
</div>

<style>
  :global(.dmd-task-page-wrap .failure .notification-bar) {
    width: 30rem;
  }
</style>
