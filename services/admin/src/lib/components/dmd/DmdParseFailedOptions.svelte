<script lang="ts">
  import type { ParseFailedDMDTask } from "@crkn-rcdr/access-data/dist/esm/dmd/Task";
  import NotificationBar from "../shared/NotificationBar.svelte";

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTask: ParseFailedDMDTask;
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <p>Invalid Metadata File</p>
  <NotificationBar message={dmdTask.process.message} status="fail" />
{/if}
