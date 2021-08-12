<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
</script>

<script lang="ts">
  /**
   * @file
   * @description This page displays the various states of and information about a dmdtask
   */
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import Loading from "$lib/components/shared/Loading.svelte";
  import type {
    WaitingDMDTask,
    FailedDMDTask,
    SucceededDMDTask,
  } from "@crkn-rcdr/access-data";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /* TODO: Later grab from backend. */
  /**
   * @type {WaitingDMDTask | FailedDMDTask | SucceededDMDTask} The dmdtask being displayed by the page.
   */
  const dmdTask: WaitingDMDTask | FailedDMDTask | SucceededDMDTask = {
    id: "123",
    updated: "1628785112",
    attachments: {
      // ...metadata file info
    },
    user: $session.user, //for now
    mdType: "marcooe",
    process: {
      requestDate: "1628785101",
      // succeeded: true,
      //message: "Bippidy Boppidy Boop",
    },
    //items: [{}],
  };
</script>

<div class="dmd-task-page-wrap">
  {#if !("succeeded" in dmdTask?.["process"])}
    <!-- TODO: move to own component -->
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
          <h6>Please wait while your DMD Task is processing...</h6>
          <div class="dmd-request-info">
            <span>Request inititated:</span>
            <span>{dmdTask?.["updated"]}</span>
            <span>Request updated:</span>
            <span>{dmdTask?.["process"]?.["requestDate"]}</span>
          </div>
        </div>
      </div>
    </div>
  {:else if !dmdTask?.["process"]?.["succeeded"]}
    <div class="hero hero__gradient full-page failure">
      <div class="wrapper">
        <div
          class="auto-align auto-align__block auto-align__column auto-align__a-center"
        >
          <h6>DMD Task Failed!</h6>
          <NotificationBar
            message={dmdTask?.["process"]?.["message"]}
            status="fail"
          />
          <div class="dmd-request-info">
            <span>Request inititated:</span>
            <span>{dmdTask?.["updated"]}</span>
            <span>Request updated:</span>
            <span>{dmdTask?.["process"]?.["requestDate"]}</span>
          </div>
          <a href="/dmd/new" class="dmd-task-try-again">
            <button class="danger">Try Again</button>
          </a>
        </div>
      </div>
    </div>
  {:else if dmdTask?.["items"]}
    success!
  {:else}
    <div class="hero hero__gradient full-page failure">
      <div class="wrapper">
        <div
          class="auto-align auto-align__block auto-align__column auto-align__a-center"
        >
          <h6>Oops!</h6>
          <NotificationBar
            message="We couldn't find any items to add metadata to from your file."
            status="fail"
          />
          <a href="/dmd/new" class="dmd-task-try-again">
            <button class="danger">Try Again</button>
          </a>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  h6 {
    text-align: center;
    font-weight: bold;
  }
  .dmd-request-info {
    width: fit-content;
    display: inline-grid;
    display: grid;
    grid-template-areas: "a a";
    gap: 2rem;
    align-items: center;
    margin-top: var(--perfect-fourth-4);
    margin-bottom: var(--perfect-fourth-4);
  }
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
  :global(.dmd-task-page-wrap .notification-bar) {
    width: 30rem;
  }
</style>
