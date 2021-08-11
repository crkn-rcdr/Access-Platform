<!--
@component
### Overview
This component allows a user to select a file, or multiple files, from their computer.

### Properties
|    |    |    |
| -- | -- | -- |
| multiple: boolean    | optional | If the file selector should support selecting multiple files or not. |

### Usage
```  
<FileSelector on:change={(e) => {
  console.logs("Access File(s) from:", e.target.files)
}} />
```
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * @type {boolean} If the file selector should support selecting multiple files or not.
   */
  export let multiple = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Triggers @event change to tell the parent component that the user has selected a file.
   * @param event
   * @returns void
   */
  function handleFileSelected(event: any) {
    const files = event.target["files"];
    const data = multiple ? files : files.length ? files[0] : null;
    dispatch("change", data);
  }
</script>

<div>
  <input
    type="file"
    name="file"
    id="file"
    class="inputfile"
    on:change={handleFileSelected}
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
