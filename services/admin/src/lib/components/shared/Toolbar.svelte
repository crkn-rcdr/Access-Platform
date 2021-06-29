<script lang="ts">
  export let title = "";
</script>

<div class="toolbar">
  <div class="auto-align auto-align__full auto-align auto-align__a-center">
    <h5>{title}</h5>
    <div class="toolbar-content">
      <slot />
    </div>
  </div>
</div>

<style>
  .toolbar {
    background-color: var(--structural-div-bg);
    padding: 0.75rem 2rem;
    width: 100%;
    height: 100%;
  }
  h5 {
    margin: 0 !important;
    display: inline;
    flex: 9;
  }
  .toolbar-content {
    flex: 3;
  }
</style>
