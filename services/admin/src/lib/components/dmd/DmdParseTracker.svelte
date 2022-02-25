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
  import type { ParsingDMDTask } from "@crkn-rcdr/access-data";
  import Loading from "$lib/components/shared/Loading.svelte";
  import { onDestroy } from "svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  /**
   * @type {ParsingDMDTask} The dmdtask being displayed.
   */
  export let dmdTask: ParsingDMDTask;
  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();
  /**
   * @type {String} A date string for when the last time the request for the DMD task was made to the backend.
   */
  let lastUpdated: string = new Date().toLocaleString();
  /**
   * @type {NodeJS.Timeout} A timed interval for sending a request to the backend to get the task.
   */
  let poller: NodeJS.Timeout;
  let error: string = "";
  /**
   * Sets up the interval @var poller that calls @function doPoll
   * @returns void
   */
  const setupPoller = (id: string) => {
    if (poller) clearPoller();
    poller = setInterval(doPoll(id), 30000);
  };
  /**
   * Sends the request to the backend to update the @var dmdTask with the lates info in the database.
   * @returns void
   */
  const doPoll = (id: string) => async () => {
    try {
      error = "";
      const response = await $session.lapin.query("dmdTask.get", id);
      if (response) dmdTask = response;
      else error = "Code 4. Please contact the platform team for assistance.";
      lastUpdated = new Date().toLocaleString();
    } catch (e) {
      error = "Code 5. Please contact the platform team for assistance.";
    }
  };
  /**
   * Adds the dmd task to the dmd task store on page load. (If it isn't in the store already)
   * @returns void
   */
  function clearPoller() {
    try {
      clearInterval(poller);
    } catch (e) {
      console.log(e?.message);
    }
  }
  /**
   * @event onDestroy
   * @description When the component instance is destroyed from the dom, clear the interval by calling @function clearPoller
   */
  onDestroy(() => {
    clearPoller();
  });
  /**
   * @listens dmdTask
   * @description Calls @function setupPoller when the @var dmdTask changes.
   */
  $: setupPoller(dmdTask["id"]);
</script>

<br />
<div
  class="auto-align auto-align__block auto-align__column auto-align__a-center"
>
  <NotificationBar message={error} status="fail" />
  {#if !error.length}
    <div class="auto-align auto-align__block auto-align__j-center">
      <Loading backgroundType="gradient" />
    </div>
    <br />
    {#if dmdTask?.fileName}
      <h5>{dmdTask.fileName}</h5>
    {/if}
    <!--br /-->
    <h6>Please wait while the metadata file parses...</h6>
    <br />
    <p>Page last refreshed on: {lastUpdated}</p>
    <br />
    <p>
      Request initiated on: {`${new Date(
        parseInt(`${dmdTask.process["requestDate"]}`) * 1000
      ).toLocaleString()}`}
    </p>
    <!--DmdTaskInfoTable {dmdTask} /-->
  {/if}
</div>

<style>
  h6 {
    text-align: center;
  }
</style>
