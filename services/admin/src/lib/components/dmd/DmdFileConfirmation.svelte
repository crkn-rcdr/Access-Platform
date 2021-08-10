<!--
@component
### Overview

### Properties
|    |    |    |
| -- | -- | -- |
| canvases: ObjectList    | optional | An ObjectList containing canvases to be listed |
| showAddButton: boolean  | optional | If the add button should be displayed over the list of canvases |

### Usage
```  
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * @type {File | undefined} description
   */
  export let metadataFile: File | undefined = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Calls @event process to tell the parent component that the user would like to process the file. TODO: add lapin request to start split here
   * @param event
   * @returns void
   */
  function handleProcess(event: any) {
    dispatch("process", event);
  }
</script>

{#if metadataFile}
  <b>Metadata File Information</b>
  <table>
    <tr>
      <td><b>Name</b></td>
      <td>{metadataFile["name"]}</td>
    </tr>
    <tr>
      <td><b>Content Type</b></td>
      <td>{metadataFile["type"]}</td>
    </tr>
    <tr>
      <td><b>Length</b></td>
      <td>{metadataFile["size"]}</td>
    </tr>
  </table>
  <br />
  <button class="button primary" type="submit" on:click={handleProcess}>
    Process File
  </button>
{/if}

<style>
  textarea {
    width: 100%;
  }
</style>
