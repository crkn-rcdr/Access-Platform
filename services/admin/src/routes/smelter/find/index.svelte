<script lang="ts">
  /**
   * @file
   * @description This page displays the information about the dipstaging process
   */
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import DipstagingLookup from "$lib/components/dipstaging/DipstagingLookup.svelte";
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import DipstagingLookupTable from "$lib/components/dipstaging/DipstagingLookupTable.svelte";
  import { onMount } from "svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";
  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let results: ImportStatus[];

  let error = "";

  onMount(async () => {
    try {
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      let startDateStr = startDate.toISOString().split("T")[0];
      //let endDate = new Date();
      let endDateStr = startDateStr; //endDate.toISOString().split("T")[0];
      const response = await $session.lapin.query("dipstaging.listFromDates", {
        from: startDateStr,
        to: endDateStr,
      });
      if (response) results = response;
      else error = "Could not search packages.";
    } catch (e) {
      return (error = e?.message);
    }
  });
</script>

<div class="dipstaging-wrap auto-align">
  <div class="lookup-wrap">
    <DipstagingLookup bind:results />
    <NotificationBar status="fail" message={error} />
  </div>

  <div class="table-wrap">
    {#if !results}
      <Loading backgroundType="gradient" />
    {:else if results?.length === 0}
      <br />
      No packages found.
    {:else}
      <DipstagingLookupTable bind:results />
    {/if}
  </div>
</div>

<style>
  .dipstaging-wrap {
    width: 100%;
  }
  .lookup-wrap {
    height: 100%;
    margin-right: 3rem;
  }
  .lookup-msg {
    opacity: 0.15;
  }
  /*.lookup-placeholder {
    width: 60%;
    margin: auto;
    opacity: 0.2;
  }*/
  .table-wrap {
    flex: 9;
    height: 100%;
  }
</style>
