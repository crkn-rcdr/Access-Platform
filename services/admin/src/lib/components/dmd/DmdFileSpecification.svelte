<!--
@component
### Overview
This component holds the form elements that correspond to the metadata file when filling out a dmd task form.

### Properties
|    |    |    |
| -- | -- | -- |
| metadataType: string or undefined    | optional | Used to tell the dmdtask deamons what kind of metadata format the metadata being processed is in. |
| metadataFile: File or undefined | Used to hold the actual file to be processed, that holds the object ids to attach the metadata to |

### Usage
```  
<DmdFileSpecification
  bind:metadataType
  bind:metadataFile
  on:fileSelected={() => {
    ...do something
  }}
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import FileSelector from "../shared/FileSelector.svelte";

  /**
   * @type {string | undefined} Used to tell the dmdtask deamons what kind of metadata format the metadata being processed is in.
   */
  export let metadataType: string | undefined = undefined;

  /**
   * @type {File | undefined} Used to hold the actual file to be processed, that holds the object ids to attach the metadata to
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
  function handleFileSelected(event: any) {
    metadataFile = event.detail;
    dispatch("fileSelected", event.detail);
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
  <FileSelector on:change={handleFileSelected} />
  <!--/fieldset-->
</div>

<style>
  select {
    width: 100%;
  }
</style>
