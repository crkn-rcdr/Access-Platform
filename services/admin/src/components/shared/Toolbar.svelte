<script lang="ts">
  import Align from "../shared/Align.svelte";
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
    border-bottom: 1px solid var(--border-color);
    padding: 12px 32px;
  }
  h5 {
    margin: 0 !important;
    display: inline;
    flex: 9;
  }
</style>
