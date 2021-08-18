<!--
@component
### Overview
Displays a dmd task in an waiting state.

### Properties
|    |    |    |
| -- | -- | -- |
| dmdTask: WaitingDMDTask | required | The dmd task to be displayed. |

### Usage
```
<DmdSplitWaitingViewer {dmdTask} />
```
-->
<script lang="ts">
  import type { WaitingDMDTask } from "@crkn-rcdr/access-data";
  import DmdTaskInfoTable from "$lib/components/dmd/DmdTaskInfoTable.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  /**
   * @type {WaitingDMDTask} The dmdtask being displayed.
   */
  export let dmdTask: WaitingDMDTask;
</script>

<br />
<div
  class="auto-align auto-align__block auto-align__column auto-align__a-center"
>
  <div class="auto-align auto-align__block auto-align__j-center">
    <Loading backgroundType="gradient" />
  </div>
  <br />
  <h6>Please wait while the metadata file processes...</h6>
  <br />

  <DmdTaskInfoTable {dmdTask} />
</div>

<style>
  h6 {
    text-align: center;
  }
</style>
