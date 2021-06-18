<script lang="ts">
  import Align from "$lib/components/shared/Align.svelte";
  export let title = "";
</script>

<div class="toolbar shadow">
  <Align vertical="center">
    <h5>{title}</h5>
    <div class="end-content">
      <slot />
    </div>
  </Align>
</div>

<style>
  .toolbar {
    background-color: var(--structural-div-bg);
    padding: 0.75rem 2rem;
  }
  h5 {
    margin: 0 !important;
    display: inline;
    flex: 9;
  }
</style>
