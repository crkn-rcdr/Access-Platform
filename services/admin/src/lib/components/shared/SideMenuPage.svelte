<script>
  export let overflowX = "auto";
  export let overflowY = "auto";
</script>

<div
  class="side-menu-page"
  style="
      overflow-x: {overflowX};
      overflow-y: {overflowY};"
>
  <slot />
</div>

<style>
  .side-menu-page {
    height: 100%;
    width: 100%;
  }
</style>
