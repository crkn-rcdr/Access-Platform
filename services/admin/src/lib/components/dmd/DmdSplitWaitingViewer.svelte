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
  import DmdTaskTimeInfoTable from "$lib/components/dmd/DmdTaskTimeInfoTable.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  /**
   * @type {WaitingDMDTask} The dmdtask being displayed.
   */
  export let dmdTask: WaitingDMDTask;
</script>

<div class="hero hero__gradient full-page">
  <div class="wrapper">
    <br />
    <br />
    <br />
    <div class="auto-align auto-align__block auto-align__j-center">
      <Loading />
    </div>
    <br />
    <div
      class="auto-align auto-align__block auto-align__column auto-align__a-center"
    >
      <h6>Please wait while the metadata upload processes...</h6>
      <DmdTaskTimeInfoTable {dmdTask} />
    </div>
  </div>
</div>
