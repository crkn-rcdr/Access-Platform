<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import { showConfirmation } from "$lib/utils/confirmation";
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import { createEventDispatcher } from "svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import Loading from "../shared/Loading.svelte";

  export let task: DMDTask;
  export let stage: "parse" | "load" | "N/A";
  export let status: "failed" | "waiting" | "succeeded" | "N/A";
  export let isListLoading: boolean = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let loading = false;

  /**
   * A helper method to slow down the rate of requests going to the backend. Causes the script to pause for 'ms.'
   * @param ms
   */
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function handleDeletePressed() {
    loading = true;
    await showConfirmation(
      async () => {
        try {
          await $session.lapin.mutation("dmdTask.delete", task.id);
          await sleep(1000);
          dispatch("delete", task);
          return {
            success: true,
            details: "",
          };
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      `Success: task deleted.`,
      `Error: failed to delete task.`
    );
  }

  /*async function handleCancelPressed() {
    loading = true;
    await showConfirmation(
      async () => {
        try {
          const route =
            stage === "export" ? "ocr.cancelExport" : "ocr./cancelImport";
          const response = await $session.lapin.mutation(route, {
            user: $session.user,
            id: task.id,
          });
          if (response) {
            task = response;
            await sleep(1000);
            dispatch("cancel", task);
            return {
              success: true,
              details: "",
            };
          } else {
            return {
              success: false,
              details:
                "Something went wrong. Please contact the platform team for assistance.",
            };
          }
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      `Success: task ${stage} canceled.`,
      `Error: failed to cancel task  ${stage}.`
    );
  }

  async function handleExportPressed() {
    loading = true;
    await showConfirmation(
      async () => {
        try {
          const response = await $session.lapin.mutation(`ocr.requestExport`, {
            user: $session.user,
            id: task.id,
          });
          if (response) {
            task = response;
            await sleep(1000);
            dispatch("export", task);
            return {
              success: true,
              details: "",
            };
          } else {
            return {
              success: false,
              details:
                "Something went wrong. Please contact the platform team for assistance.",
            };
          }
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "Success: task queued for exporting.",
      "Error: failed queue task for exporting."
    );
  }

  async function handleImportPressed() {
    loading = true;
    await showConfirmation(
      async () => {
        try {
          const response = await $session.lapin.mutation(`ocr.requestImport`, {
            user: $session.user,
            id: task.id,
          });
          if (response) {
            task = response;
            await sleep(1000);
            dispatch("import", task);
            return {
              success: true,
              details: "",
            };
          } else {
            return {
              success: false,
              details:
                "Something went wrong. Please contact the platform team for assistance.",
            };
          }
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "Success: task queued for importing.",
      "Error: failed queue task for importing."
    );
  }

  async function handleRetryPressed() {
    if (stage === "export") await handleExportPressed();
    else await handleImportPressed();
  }*/

  $: if (!isListLoading) loading = false;
</script>

{#if task}
  <span class="actions auto-align auto-align__a-center auto-align__j-end">
    {#if loading}
      <Loading backgroundType="gradient" size="sm" />
    {:else}
      {#if status === "waiting"}
        <a href={`/dmd/${task.id}`}>
          <button class="action secondary"> Track </button>
        </a>
      {:else if status === "failed"}
        <a href={`/dmd/${task.id}`}>
          <button class="action secondary"> Review </button>
        </a>
      {:else if status === "succeeded"}
        {#if stage === "parse"}
          <a href={`/dmd/${task.id}`}>
            <button class="action save"> Load Metadata </button>
          </a>
        {:else}
          <a href={`/dmd/${task.id}`}>
            <button class="action secondary"> Review </button>
          </a>
        {/if}
      {:else if status === "N/A"}
        <a href={`/dmd/${task.id}`}>
          <button class="action save"> Open Issue </button>
        </a>
      {/if}

      <div class="action icon" on:click={handleDeletePressed}>
        <TiTrash />
      </div>
    {/if}
  </span>
{/if}

<style>
  .actions {
    text-align: right;
  }
  .action {
    margin-left: 1rem;
  }
  .action.icon {
    opacity: 0.6;
    cursor: pointer;
  }
  button {
    min-width: 10rem;
  }
</style>
