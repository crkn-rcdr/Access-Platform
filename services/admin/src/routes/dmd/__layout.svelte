<script>
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
</script>

<div class="backdrop">
  <div class="wrapper title">
    <p>Descriptive Metadata Updater</p>
  </div>
  <div class="wrapper form">
    <slot />
  </div>
</div>

<style>
  .backdrop {
    padding: var(--perfect-fourth-4);
    background: var(--structural-div-bg); /*var(--color-gradient);*/
    height: 100%;
    min-height: calc(100vh - 7.5rem);
  }
  .form {
    background: var(--base-bg);
    height: 100%;
    min-height: 52rem;
    border-radius: var(--border-radius);
    padding: var(--perfect-fourth-4);
  }
  p {
    color: var(--secondary);
    margin-bottom: var(--margin-sm) !important;
  }
</style>
