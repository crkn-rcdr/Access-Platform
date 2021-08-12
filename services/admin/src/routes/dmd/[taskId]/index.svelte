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

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /* Later grab from backend. */
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
    },
  };
</script>

{#if !dmdTask["split"]}
  <!-- TODO: move to component -->
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
{:else if !dmdTask?.["split"]?.["success"]}
  fail
{:else}
  success!
{/if}

<style>
  h6 {
    text-align: center;
  }
  .dmd-request-info {
    width: fit-content;
    display: inline-grid;
    display: grid;
    grid-template-areas: "a a";
    gap: 2rem;
    align-items: center;
    margin-top: var(--perfect-fourth-4);
  }
</style>
