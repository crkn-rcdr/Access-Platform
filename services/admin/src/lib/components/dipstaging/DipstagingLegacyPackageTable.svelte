<script lang="ts">
  import type { LegacyPackage } from "@crkn-rcdr/access-data";

  export let results: LegacyPackage[];
</script>

table of results:
{#if results}
  {JSON.stringify(results)}
{/if}
