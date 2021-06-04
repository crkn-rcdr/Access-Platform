<script lang="ts">
  import Align from "../shared/Align.svelte";
</script>

<div class="canvas-selector-wrap">
  <Align direction="column" vertical="center">
    <input placeholder="search" />
    <div>list/select</div>
  </Align>
</div>

<style>
  .canvas-selector-wrap {
    width: 100%;
  }
  input {
    width: 95%;
  }
</style>
