<script context="module" lang="ts">
</script>

<script lang="ts">
  import PrefixSlugSearchBox from "$lib/components/access-objects/PrefixSlugSearchBox.svelte";
</script>

<label>
  Batch Name:
  <input />
</label>

<label>Search for canvases</label>
<PrefixSlugSearchBox />

<table>
  Select<br />
  Slug<br />
  Label<br />
  # Canvases<br />
  Error ---
</table>

total # selected Canvases
<cancel button />
<create button />
