<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import { showConfirmation } from "$lib/utils/confirmation";
  import type { ShortTask } from "@crkn-rcdr/access-data";
  import { createEventDispatcher } from "svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import Loading from "../shared/Loading.svelte";

  export let task: ShortTask;
  export let stage: "parse" | "load" | "N/A";
  export let status: "failed" | "waiting" | "succeeded" | "paused" | "N/A";
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
          loading = false;
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
      {:else if status === "paused"}
        <a href={`/dmd/${task.id}`}>
          <button class="action save"> Resume Load</button>
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
        <a
          href={`https://github.com/crkn-rcdr/Access-Platform/issues/new?title=DMD+Task+file+not+uploading+correctly&body=DMD+task+id:+${task.id}&labels[]=bug`}
          target="_blank"
        >
          <button class="action danger"> Open Issue </button>
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
