<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<div>
  <input
    type="file"
    name="file"
    id="file"
    class="inputfile"
    on:change={(e) => {
      dispatch("change", e);
    }}
  />
  <label for="file" class="button primary">Choose File</label>
</div>

<style>
  .inputfile {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
</style>
