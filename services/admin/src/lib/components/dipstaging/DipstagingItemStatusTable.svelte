<script lang="ts">
  import type { ImportStatus } from "@crkn-rcdr/access-data";

  export let results: ImportStatus[];
</script>

table of results:
{#if results}
  {JSON.stringify(results)}
{/if}
