<script lang="ts">
  export let display = "inline-flex";
  export let horizontal = "flex-start";
  export let vertical = "flex-start";
  export let direction = "row";
</script>

<div
  class="align"
  style="
        display: {display};
        justify-content: {horizontal}; 
        align-items: {vertical};
        flex-direction: {direction};"
>
  <slot />
</div>

<style>
  .align {
    width: 100%;
    height: 100%;
  }
</style>
