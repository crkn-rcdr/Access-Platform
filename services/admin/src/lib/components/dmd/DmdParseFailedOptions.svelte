<script lang="ts">
  import type { DMDTask } from "@crkn-rcdr/access-data";
  import NotificationBar from "../shared/NotificationBar.svelte";

  /**
   *  @type { DMDTask } The DMDTask being processed.
   */
  export let dmdTask: DMDTask;
</script>

{#if dmdTask}
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <p>Invalid Metadata File</p>
  <NotificationBar message={dmdTask.process?.["message"]} status="fail" />
{/if}
