<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      console.log("page", page);
      if (page?.params?.["taskid"]) {
        const response = await context.lapin.query(
          "dmdTask.get",
          page.params["taskid"]
        );

        if (response)
          return {
            props: {
              dmdTask: response.task,
              totalItems: response.totalItems,
              totalPages: response.totalPages,
              type: page.params["type"],
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
  import type { DMDTask } from "@crkn-rcdr/access-data";
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
  export let dmdTask: DMDTask;

  export let type:
    | "N/A"
    | "paused"
    | "load-succeeded"
    | "load-failed"
    | "loading"
    | "parse-succeeded"
    | "parse-failed"
    | "parsing";

  export let totalItems: number = 0;
  export let totalPages: number = 0;

  export let lookupResultsMap = {};

  export let error: any;
</script>

<div class="dmd-task-page-wrap">
  <!--{#if pageData}
    {JSON.stringify(pageData)}
  {:else}
    none
  {/if}-->

  {#if error}
    {error?.message}
  {:else if !dmdTask}
    Loading...
  {:else if type === "paused"}
    <DmdUpdatePausedOptions bind:dmdTask />
    <DmdItemsTable bind:dmdTask bind:type bind:totalItems bind:totalPages />
  {:else if type === "load-succeeded"}
    <DmdUpdateSuccessOptions bind:dmdTask />
    <DmdItemsTable bind:dmdTask bind:type bind:totalItems bind:totalPages />
  {:else if type === "load-failed"}
    <DmdUpdateFailedOptions bind:dmdTask />
    <DmdItemsTable bind:dmdTask bind:type bind:totalItems bind:totalPages />
  {:else if type === "loading"}
    <DmdUpdateProgress bind:dmdTask />
    <DmdItemsTable bind:dmdTask bind:type bind:totalItems bind:totalPages />
  {:else if type === "parse-succeeded"}
    <DmdUpdateOptions bind:dmdTask bind:lookupResultsMap />
    <DmdItemsTable
      bind:dmdTask
      bind:lookupResultsMap
      bind:type
      bind:totalItems
      bind:totalPages
    />
    <br />
    <br />
    <br />
    <br />
    <br />
  {:else if type === "parse-failed"}
    <DmdParseFailedOptions bind:dmdTask />
  {:else if type === "parsing"}
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
