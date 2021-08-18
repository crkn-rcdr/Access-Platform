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
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
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
   * @type {string} Used to show a confirmation to the user that their file has been selected.
   */
  let fileName: string = "";

  /**
   * Triggers @event change to tell the parent component that the user has selected a file.
   * @param event
   * @returns void
   */
  function handleFileSelected(event: any) {
    const files = event.target["files"];
    let data = null;
    if (multiple) {
      fileName = files.map((file) => file["name"]).join(",");
      data = files;
    } else if (files.length) {
      fileName = files[0]["name"];
      data = files[0];
    }
    dispatch("change", data);
  }
</script>

<div class="auto-align auto-align__a-center">
  <span>
    <input
      type="file"
      name="file"
      id="file"
      class="inputfile"
      on:change={handleFileSelected}
      {multiple}
    />
    <label for="file" class="button secondary">Choose File</label>
  </span>
  {#if fileName}
    <div class="file-name auto-align auto-align__a-center">
      <div class="icon"><FaCheckCircle /></div>
      {fileName}
    </div>
  {/if}
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

  .icon {
    margin-left: var(--margin-lg);
    margin-right: var(--margin-sm);
    color: var(--success);
  }

  .file-name {
    max-width: 30rem;
  }
</style>
