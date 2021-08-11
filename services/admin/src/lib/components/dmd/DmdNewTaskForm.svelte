<!--
@component
### Overview

### Properties
none

### Usage
```  
 <DmdNewTaskForm />
```
-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import DmdNewTaskFileSpecification from "$lib/components/dmd/DmdNewTaskFileSpecification.svelte";
  import DmdNewTaskFileInformation from "$lib/components/dmd/DmdNewTaskFileInformation.svelte";
  //import DmdPrefixSelector from "$lib/components/dmd/DmdPrefixSelector.svelte";
  import { getStores } from "$app/stores";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} Used to tell the dmdtask deamons what kind of metadata format the metadata being processed is in.
   */
  let metadataType = "";

  /**
   * @type {File | undefined} Used to hold the actual file to be processed, that holds the object ids to attach the metadata to.
   */
  let metadataFile: File | undefined = undefined;

  /**
   * @type {string | undefined} This is the base 64 encoded string for the metadata file that will be stored in the couch attachment.
   */
  let b64EncodedMetadataFileText: string | undefined = undefined;

  function handleCreateTask() {
    const bodyObj = {
      user: $session.user,
      mdType: metadataType,
      file: b64EncodedMetadataFileText,
    };
    console.log(bodyObj);
  }
</script>

<h6>Enter DMD Task Information</h6>
<DmdNewTaskFileSpecification
  bind:metadataType
  bind:metadataFile
  on:fileSelected={async () => {
    const metadataFileText = await metadataFile.text();
    if (metadataFileText) {
      b64EncodedMetadataFileText = btoa(metadataFileText);
    }
    // Todo, error
  }}
/>
<br />
<br />
<br />

<h6>Review Selections & Inititate Metadata File Processing</h6>
<b>Metadata Type: </b><span>{metadataType}</span>
<br />
<br />
<DmdNewTaskFileInformation bind:metadataFile />

{#if metadataType && b64EncodedMetadataFileText}
  <br />
  <br />
  <button class="primary" on:click={handleCreateTask}>Create Task</button>
{/if}
