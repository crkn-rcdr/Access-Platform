<!--
@component
### Overview
Displays a dmd task's time based information in a table, the user sees the task request date and the process last updated date.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTask: WaitingDMDTask or FailedDMDTask or SucceededDMDTask  | required | The dmd task to be displayed. |

### Usage
```
<DmdTaskTimeInfoTable {dmdTask} />
```
-->
<script lang="ts">
  import type {
    WaitingDMDTask,
    FailedDMDTask,
    SucceededDMDTask,
  } from "@crkn-rcdr/access-data";
  /**
   * @type {WaitingDMDTask | FailedDMDTask | SucceededDMDTask | undefined} The dmdtask being displayed.
   */
  export let dmdTask:
    | WaitingDMDTask
    | FailedDMDTask
    | SucceededDMDTask
    | undefined;
</script>

<div class="dmd-request-info grid grid__col_2">
  <span>Request inititated:</span>
  <span>{dmdTask?.["updated"]}</span>
  <span>Request updated:</span>
  <span>{dmdTask?.["process"]?.["requestDate"]}</span>
</div>

<style>
  .dmd-request-info {
    width: fit-content;
    margin-top: var(--perfect-fourth-4);
    margin-bottom: var(--perfect-fourth-4);
  }
</style>
