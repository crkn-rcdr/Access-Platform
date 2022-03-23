<script lang="ts">
  import { session } from "$app/stores";
  import timer from "$lib/stores/timer";
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import { onDestroy, onMount } from "svelte";
  //import LoadingButton from "../shared/LoadingButton.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";
  import ProgressBar from "../shared/ProgressBar.svelte";

  /**
   *  @type { string } The DMDTask being processed.
   */
  export let dmdTask: DMDTask;

  let unsubscribe;
  const interval = timer({ interval: 30000 }); // 2x per min

  let sendingPauseRequest = false;

  async function handlePausePressed() {
    sendingPauseRequest = true;
    await $session.lapin.mutation("dmdTask.pauseStorage", {
      task: dmdTask.id,
      user: $session.user,
    });
    window.location.reload();
  }

  async function handleTestCompletePressed() {
    console.log(dmdTask);
    await $session.lapin.mutation("dmdTask.processArray", {
      id: dmdTask.id,
      array: dmdTask["items"].map((item) => {
        return {
          ...item,
          stored: true,
        };
      }),
    });
  }

  onMount(() => {
    if (!("progress" in dmdTask)) dmdTask["progress"] = 0;
    unsubscribe = interval.subscribe(async () => {
      const response = await $session.lapin.query("dmdTask.get", dmdTask.id);
      if (response) {
        if (!("progress" in response.task)) response.task["progress"] = 0;
        dmdTask = response.task;
      }
    });
  });

  async function handleTest() {
    // reset task to validated and refresh
    await $session.lapin.mutation("dmdTask.updateStorageResults", {
      id: dmdTask.id,
      array: [
        [1, true],
        [0, true],
      ],
    });
    window.location.reload();
  }

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
    message="Please wait while the metadata is loaded..."
  />
  <ProgressBar
    bind:progress={dmdTask["progress"]}
    progressText={dmdTask["progress"] === 100 ? "done!" : "loaded..."}
  />
  <br />
  <!--button on:click={handleTest}>Test Progress</button>
  <button on:click={handleTestCompletePressed}>Test Complete</button-->

  <!--div>
    <LoadingButton
      buttonClass="secondary"
      on:clicked={handlePausePressed}
      showLoader={sendingPauseRequest}
    >
      <span slot="content">Pause Metadata Load</span>
    </LoadingButton>
  </div-->
{/if}

<style>
  div {
    margin-bottom: 1rem;
  }
</style>
