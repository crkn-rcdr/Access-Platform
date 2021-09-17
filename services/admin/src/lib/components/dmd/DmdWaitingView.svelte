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
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import type { WaitingDMDTask } from "@crkn-rcdr/access-data";
  import DmdTaskInfoTable from "$lib/components/dmd/DmdTaskInfoTable.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  import { onDestroy } from "svelte";

  /**
   * @type {WaitingDMDTask} The dmdtask being displayed.
   */
  export let dmdTask: WaitingDMDTask;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let lastUpdated: string = new Date().toLocaleString();
  let poller: NodeJS.Timeout;

  const setupPoller = (id: string) => {
    if (poller) {
      clearInterval(poller);
    }
    poller = setInterval(doPoll(id), 30000);
  };

  const doPoll = (id: string) => async () => {
    const response = await $session.lapin.query("dmdTask.find", id);
    if (response && "result" in response) dmdTask = response.result;

    lastUpdated = new Date().toLocaleString();
  };

  onDestroy(() => clearInterval(poller));

  $: setupPoller(dmdTask["id"]);
</script>

<br />
<div
  class="auto-align auto-align__block auto-align__column auto-align__a-center"
>
  <div class="auto-align auto-align__block auto-align__j-center">
    <Loading backgroundType="gradient" />
  </div>
  <br />
  {#if dmdTask?.fileName}
    <h5>{dmdTask.fileName}</h5>
  {/if}
  <!--br /-->
  <h6>Please wait while the metadata file processes...</h6>
  <br />
  <p>Page last refreshed on: {lastUpdated}</p>
  <br />
  <p>
    Request initiated on: {`${new Date(
      parseInt(`${dmdTask.process["requestDate"]}`) * 1000
    ).toLocaleString()}`}
  </p>
  <!--DmdTaskInfoTable {dmdTask} /-->
</div>

<style>
  h6 {
    text-align: center;
  }
</style>
