<script lang="ts">
  /**
   * @file
   * @description This page displays the information about the dipstaging process
   */
  import DipstagingLookup from "$lib/components/dipstaging/DipstagingLookup.svelte";
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import DipstagingLookupTable from "$lib/components/dipstaging/DipstagingLookupTable.svelte";
  let results: ImportStatus[];
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
