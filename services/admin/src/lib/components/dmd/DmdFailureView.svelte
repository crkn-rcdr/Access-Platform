<!--
@component
### Overview
Displays a dmd task in an error state.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTask: UpdateFailedDMDTask or undefined | optional | The dmd task to be displayed. |
| message: string | required | The message to be displayed in the error notification bar. |

### Usage
```  
<DmdSplitFailureViewer
  {dmdTask}
  message="Something went wrong!"
/>
```
-->
<script lang="ts">
  import type { UpdateFailedDMDTask } from "@crkn-rcdr/access-data";
  import DmdTaskInfoTable from "$lib/components/dmd/DmdTaskInfoTable.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

  /**
   * @type {UpdateFailedDMDTask | undefined} The dmdtask being displayed.
   */
  export let dmdTask: UpdateFailedDMDTask | undefined = undefined;

  /**
   * @type {string} The message to be displayed in the error notification bar.
   */
  export let message: string;
</script>

<div
  class="auto-align auto-align__block auto-align__column auto-align__a-center"
>
  <br />
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <h6>Metadata Upload Failed!</h6>
  <br />
  <NotificationBar {message} status="fail" />
  <DmdTaskInfoTable {dmdTask} />
  <a href="/dmd/new" class="dmd-task-try-again">
    <button class="danger">Try Again</button>
  </a>
</div>

<style>
  .dmd-task-try-again {
    margin-top: var(--perfect-fourth-4);
    margin-bottom: var(--perfect-fourth-4);
  }
  h6 {
    text-align: center;
  }
</style>
