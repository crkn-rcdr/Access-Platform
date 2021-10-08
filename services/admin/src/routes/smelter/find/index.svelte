<script lang="ts">
  /**
   * @file
   * @description This page displays the information about the dipstaging process
   */
  import DipstagingLookup from "$lib/components/dipstaging/DipstagingLookup.svelte";
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import DipstagingItemStatusTable from "$lib/components/dipstaging/DipstagingItemStatusTable.svelte";
  let results: ImportStatus[] = [];
</script>

<DipstagingLookup bind:results />
<DipstagingItemStatusTable bind:results />
