<!--
@component
### Overview
Displays a dmd task in an error state.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTask: FailedDMDTask | required | The dmd task to be displayed. |
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
  import type { FailedDMDTask } from "@crkn-rcdr/access-data";
  import DmdTaskTimeInfoTable from "$lib/components/dmd/DmdTaskTimeInfoTable.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

  /**
   * @type {FailedDMDTask} The dmdtask being displayed.
   */
  export let dmdTask: FailedDMDTask;

  /**
   * @type {string} The message to be displayed in the error notification bar.
   */
  export let message: string;
</script>

<div class="hero hero__gradient full-page failure">
  <div class="wrapper">
    <div
      class="auto-align auto-align__block auto-align__column auto-align__a-center"
    >
      <h6>Metadata Upload Failed!</h6>
      <NotificationBar {message} status="fail" />
      <DmdTaskTimeInfoTable {dmdTask} />
      <a href="/dmd/new" class="dmd-task-try-again">
        <button class="danger">Try Again</button>
      </a>
    </div>
  </div>
</div>

<style>
  .dmd-task-try-again {
    margin-top: var(--perfect-fourth-4);
    margin-bottom: var(--perfect-fourth-4);
  }
  .failure {
    filter: hue-rotate(207deg);
  }
  .failure > * {
    filter: hue-rotate(-207deg);
  }
</style>
