<!--
@component
### Overview
Displays a dmd task's time based information in a table, the user sees the task request date and the process last updated date.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTask: DMDTask | required | The dmd task to be displayed. |

### Usage
```
<DmdTaskTimeInfoTable {dmdTask} />
```
-->
<script lang="ts">
  import type { DMDTask } from "@crkn-rcdr/access-data";
  /**
   * @type {DMDTask} The dmdtask being displayed.
   */
  export let dmdTask: DMDTask;
</script>

<div class="dmd-request-info grid grid__col_2">
  {#if dmdTask?.updated}
    <span>Request inititated:</span>
    <span>
      {`${new Date(parseInt(`${dmdTask.updated}`) * 1000).toLocaleString()}`}
    </span>
  {/if}
  {#if dmdTask?.process?.["requestDate"]}
    <span>Request updated:</span>
    <span>
      {`${new Date(
        parseInt(`${dmdTask.process["requestDate"]}`) * 1000
      ).toLocaleString()}`}
    </span>
  {/if}
</div>

<style>
  .dmd-request-info {
    width: fit-content;
    margin-top: var(--perfect-fourth-4);
    margin-bottom: var(--perfect-fourth-4);
  }
</style>
