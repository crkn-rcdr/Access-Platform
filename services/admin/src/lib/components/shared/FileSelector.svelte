<script>
  import { createEventDispatcher } from "svelte";

  export let multiple = false;
  const dispatch = createEventDispatcher();
</script>

<div>
  <input
    type="file"
    name="file"
    id="file"
    class="inputfile"
    on:change={(e) => {
      const files = e.target["files"];
      const data = multiple ? files : files.length ? files[0] : null;
      dispatch("change", data);
    }}
    {multiple}
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
