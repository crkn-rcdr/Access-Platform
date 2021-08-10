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
  import FileSelector from "../shared/FileSelector.svelte";

  /**
   * @type {} description
   */
  export let metadataType: string | undefined = undefined;

  /**
   * @type {} description
   */
  export let metadataFile: File | undefined = undefined;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Calls @event fileSelected to tell the parent component that a file has been selected. Sets the @var metadataFile to the selected file for convenience.
   * @param event
   * @returns void
   */
  function handleFileselected(event: any) {
    dispatch("fileSelected", event.detail);
    metadataFile = event.detail;
  }
</script>

<div>
  <!--fieldset>
    <legend>Metadata File Information</legend-->
  <div>
    <label for="metadata-type">Metadata Type:</label>
    <select name="metadata-type" bind:value={metadataType}>
      <option value="" />
      <option value="issueinfocsv">Issueinfo CSV</option>
      <option value="dccsv">Dublin Core CSV</option>
      <option value="marc490">MARC - ID in 490</option>
      <option value="marcoocihm">MARC - ID in oocihm interpretation</option>
      <option value="marcooe">MARC - ID in ooe interpretation</option>
    </select>
  </div>
  <br />
  <span>Metadata File:</span>
  <FileSelector on:change={handleFileselected} />
  <!--/fieldset-->
</div>

<style>
  select {
    width: 100%;
  }
</style>
