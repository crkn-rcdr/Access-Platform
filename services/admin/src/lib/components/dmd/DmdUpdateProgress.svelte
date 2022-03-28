<script lang="ts">
  import { session } from "$app/stores";
  import timer from "$lib/stores/timer";
  import { showConfirmation } from "$lib/utils/confirmation";
  import type { DMDTask, ShortTaskType } from "@crkn-rcdr/access-data";
  import { onDestroy, onMount } from "svelte";
  import LoadingButton from "../shared/LoadingButton.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import ProgressBar from "../shared/ProgressBar.svelte";
  import DmdItemsTable from "./DmdItemsTable.svelte";

  /**
   *  @type { string } The DMDTask being processed.
   */
  export let dmdTask: DMDTask;
  export let type: ShortTaskType;
  export let totalItems: number = 0;
  export let totalPages: number = 0;

  let unsubscribe;
  const interval = timer({ interval: 30000 }); // 2x per min
  let currentPage = 1;
  let progress = 0;
  let sendingPauseRequest = false;

  async function handlePausePressed() {
    sendingPauseRequest = true;
    await showConfirmation(
      async () => {
        try {
          await $session.lapin.mutation("dmdTask.pauseStorage", {
            id: dmdTask.id,
            user: $session.user,
          });
          window.location.reload();
          return {
            success: true,
          };
        } catch (e) {
          return {
            success: false,
            details: e?.message,
          };
        }
      },
      "",
      "Error: failed to pause storage.",
      true
    );
  }

  async function getProgress() {
    await showConfirmation(
      async () => {
        try {
          const response = await $session.lapin.query(
            "dmdTask.progress",
            dmdTask.id
          );
          if (response) {
            progress = response;
            if (progress === 100) window.location.reload();
          }
          return {
            success: true,
          };
        } catch (e) {
          return {
            success: false,
            details: e?.message,
          };
        }
      },
      "",
      "Error: could not refresh progress.",
      true
    );
  }

  async function getPage() {
    await showConfirmation(
      async () => {
        try {
          const pageData = await $session.lapin.query("dmdTask.page", {
            id: dmdTask.id,
            page: currentPage,
            limit: 100,
          });
          if (pageData && pageData.list) dmdTask["items"] = pageData.list;
          return {
            success: true,
          };
        } catch (e) {
          return {
            success: false,
            details: e?.message,
          };
        }
      },
      "",
      "Error: could not refresh items table.",
      true
    );
  }

  onMount(() => {
    if (!("progress" in dmdTask)) dmdTask["progress"] = 0;
    unsubscribe = interval.subscribe(async () => {
      await getProgress();
      await getPage();
    });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}

  <NotificationBar
    status="secondary"
    message="Please wait while the metadata is storing..."
  />
  <ProgressBar
    {progress}
    progressText={progress === 100 ? "done!" : "stored..."}
  />
  <br />

  <div>
    <LoadingButton
      buttonClass="secondary"
      on:clicked={handlePausePressed}
      showLoader={sendingPauseRequest}
    >
      <span slot="content">Pause Metadata Storing</span>
    </LoadingButton>
  </div>
{/if}
<DmdItemsTable
  bind:dmdTask
  bind:currentPage
  bind:type
  bind:totalItems
  bind:totalPages
/>

<style>
  div {
    margin-bottom: 1rem;
  }
</style>
