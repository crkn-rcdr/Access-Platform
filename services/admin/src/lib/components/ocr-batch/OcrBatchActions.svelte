<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import { showConfirmation } from "$lib/utils/confirmation";
  import type { OcrBatch } from "@crkn-rcdr/access-data";
  import { createEventDispatcher } from "svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import Loading from "../shared/Loading.svelte";

  export let batch: OcrBatch;
  export let stage: "export" | "import" | "N/A";
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
          await $session.lapin.mutation("ocr.delete", batch.id);
          await sleep(1000);
          dispatch("delete", batch);
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
      `Success: batch deleted.`,
      `Error: failed to delete batch.`
    );
  }

  async function handleCancelPressed() {
    loading = true;
    await showConfirmation(
      async () => {
        try {
          const route =
            stage === "export" ? "ocr.cancelExport" : "ocr.cancelImport";
          const response = await $session.lapin.mutation(route, {
            user: $session.user,
            id: batch.id,
          });
          if (response) {
            batch = response;
            await sleep(1000);
            dispatch("cancel", batch);
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
      `Success: batch ${stage} canceled.`,
      `Error: failed to cancel batch  ${stage}.`
    );
  }

  async function handleExportPressed() {
    loading = true;
    await showConfirmation(
      async () => {
        try {
          const response = await $session.lapin.mutation(`ocr.requestExport`, {
            user: $session.user,
            id: batch.id,
          });
          if (response) {
            batch = response;
            await sleep(1000);
            dispatch("export", batch);
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
      "Success: batch queued for exporting.",
      "Error: failed queue batch for exporting."
    );
  }

  async function handleImportPressed() {
    loading = true;
    await showConfirmation(
      async () => {
        try {
          const response = await $session.lapin.mutation(`ocr.requestImport`, {
            user: $session.user,
            id: batch.id,
          });
          if (response) {
            batch = response;
            await sleep(1000);
            dispatch("import", batch);
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
      "Success: batch queued for importing.",
      "Error: failed queue batch for importing."
    );
  }

  async function handleRetryPressed() {
    if (stage === "export") await handleExportPressed();
    else await handleImportPressed();
  }

  $: if (!isListLoading) loading = false;
</script>

{#if batch}
  <span class="actions auto-align auto-align__a-center auto-align__j-end">
    {#if loading}
      <Loading backgroundType="gradient" size="sm" />
    {:else}
      {#if status === "waiting"}
        <button class="action secondary" on:click={handleCancelPressed}>
          Cancel
        </button>
      {:else if status === "failed"}
        <button class="action secondary" on:click={handleRetryPressed}>
          Retry
        </button>
      {:else if status === "succeeded" && stage === "export"}
        <button class="action save" on:click={handleImportPressed}>
          Import
        </button>
      {:else if status === "N/A"}
        <button class="action save" on:click={handleExportPressed}>
          Export
        </button>
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
