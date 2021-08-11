<!--
@component
### Overview
This component shows a summary of the metadata file that was selected for processing to the user. 

### Properties
|    |    |    |
| -- | -- | -- |
| metadataFile: File or undefined | optional | The metadata file that was selected for processing |

### Usage
``` 
<DmdFileConfirmation
  bind:metadataFile
/> 
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * @type {File | undefined} The metadata file that was selected for processing
   */
  export let metadataFile: File | undefined = undefined;
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
{/if}
