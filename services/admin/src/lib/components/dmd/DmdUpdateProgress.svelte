<script lang="ts">
  import { session } from "$app/stores";
  import timer from "$lib/stores/timer";
  import type { UpdatingDMDTask } from "@crkn-rcdr/access-data";
  import { onDestroy, onMount } from "svelte";
  import ProgressBar from "../shared/ProgressBar.svelte";

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTask: UpdatingDMDTask;

  let unsubscribe;
  const interval = timer({ interval: 30000 }); // 2x per min

  let progress = 0;

  // every so often poll dmdtask
  // track status each item update progress
  function updateProgress() {
    let numComplete = 0;
    for (const item of dmdTask.items) {
      if ("stored" in item) {
        numComplete++;
      }
    }
    if (numComplete !== 0)
      progress = Math.round((numComplete / dmdTask.items.length) * 100);
    else progress = 0;
  }

  onMount(() => {
    updateProgress();
    unsubscribe = interval.subscribe(async () => {
      const response = await $session.lapin.query("dmdTask.get", dmdTask.id);
      if (response) dmdTask = response;
      updateProgress();
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
  <p>Loading Metadata</p>

  <ProgressBar
    {progress}
    progressText={progress === 100 ? "done!" : "loaded..."}
  />
  <br />
{/if}
