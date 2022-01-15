<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      let startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      let startDateStr = startDate.toISOString().split("T")[0];
      //let endDate = new Date();
      let endDateStr = startDateStr; //endDate.toISOString().split("T")[0];
      const response = await context.lapin.query("dipstaging.listFromDates", {
        from: startDateStr,
        to: endDateStr,
      });
      if (response) return { props: { results: response } };
      else return { props: { error: "Could not search packages." } };
    } catch (e) {
      return { props: { error: e?.message } };
    }
  };
</script>

<script lang="ts">
  /**
   * @file
   * @description This page displays the information about the dipstaging process
   */
  import DipstagingLookup from "$lib/components/dipstaging/DipstagingLookup.svelte";
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import DipstagingLookupTable from "$lib/components/dipstaging/DipstagingLookupTable.svelte";
  export let results: ImportStatus[];
</script>

<div class="dipstaging-wrap auto-align">
  <div class="lookup-wrap">
    <DipstagingLookup bind:results />
  </div>

  <div class="table-wrap">
    <DipstagingLookupTable bind:results />

    {#if !results}
      <div class="lookup-msg">
        <br />
        <i>Look-up results will appear here.</i>
      </div>
      <!--img
        class="lookup-placeholder"
        src="/static/search.svg"
        alt="Search Canadiana"
      /-->
    {:else if results.length === 0}
      <br />
      No packages found.
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
