<!--
@component
### Overview
Displays a dmd task's information in a table.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTask: DMDTask | required | The dmd task to be displayed. |

### Usage
```
<DmdTaskInfoTable {dmdTask} />
```
-->
<script lang="ts">
  import { DMDTask, SucceededDMDTask } from "@crkn-rcdr/access-data";
  /**
   * @type {DMDTask} The dmdtask being displayed.
   */
  export let dmdTask: DMDTask;

  /**
   * @type {"column" | "row"} If the information should be row or column based. If column is selected, all information will be displayed in one column. Otherwise, a 3x3 grid will be used.
   */
  export let direction: "column" | "row" = "column";
</script>

{#if dmdTask}
  <div
    class={`dmd-request-info ${
      direction !== "column"
        ? "grid grid__col_3 grid__space-evenly"
        : "grid grid__col_1 restrict-width"
    }`}
  >
    {#if SucceededDMDTask.safeParse(dmdTask).success}
      <div class="grid grid__col_2">
        {#if dmdTask?.id}
          <span>id:</span>
          <span class="value">
            {dmdTask.id}
          </span>
        {/if}
        {#if dmdTask?.format}
          <span>format:</span>
          <span class="value">
            {dmdTask.format}
          </span>
        {/if}
      </div>

      {#if dmdTask.user}
        <div class="grid grid__col_2">
          <span>Initiated by name:</span>
          <span class="value">
            {dmdTask.user.name}
          </span>
          <span>Initiated by email:</span>
          <span class="value">
            {dmdTask.user.email}
          </span>
        </div>
      {/if}

      {#if dmdTask.process["processDate"]}
        <span>processed:</span>
        <span class="value">
          {`${new Date(
            parseInt(`${dmdTask.process["processDate"]}`) * 1000
          ).toLocaleString()}`}
        </span>
      {/if}
    {/if}

    <div class="grid grid__col_2">
      {#if dmdTask.process["requestDate"]}
        <span>Inititated at:</span>
        <span class="value">
          {`${new Date(
            parseInt(`${dmdTask.process["requestDate"]}`) * 1000
          ).toLocaleString()}`}
        </span>
      {/if}
      {#if dmdTask.updated}
        <span>Updated at:</span>
        <span class="value">
          {`${new Date(
            parseInt(`${dmdTask.updated}`) * 1000
          ).toLocaleString()}`}
        </span>
      {/if}
    </div>
  </div>
{/if}

<style>
  .dmd-request-info {
    width: 100%;
  }
  .value {
    text-align: right;
  }
  .restrict-width {
    max-width: 25rem;
  }
</style>
