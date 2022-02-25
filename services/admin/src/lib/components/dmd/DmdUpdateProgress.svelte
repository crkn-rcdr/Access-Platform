<script lang="ts">
  import type { UpdatingDMDTask } from "@crkn-rcdr/access-data";
  import ProgressBar from "../shared/ProgressBar.svelte";

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTask: UpdatingDMDTask;

  let progress = 0;

  // every so often poll dmdtask
  // track status each item update progress
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}

  <ProgressBar
    {progress}
    progressText={progress === 100 ? "done!" : "files updated..."}
  />
  <br />
{/if}
