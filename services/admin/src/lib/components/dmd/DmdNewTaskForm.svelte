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
  import FileSelector from "$lib/components/shared/FileSelector.svelte";
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
   * @type {string | undefined} This is the base 64 encoded string for the metadata file that will be stored in the couch attachment.
   */
  let b64EncodedMetadataFileText: string | undefined = undefined;

  async function handleFileSelected(event: any) {
    const file: File = event.detail;
    const metadataFileText = await file.text();
    if (metadataFileText) {
      b64EncodedMetadataFileText = btoa(metadataFileText);
    }
  }

  async function handleCreateTask() {
    const bodyObj = {
      user: $session.user,
      mdType: metadataType,
      file: b64EncodedMetadataFileText,
    };
    console.log(bodyObj);
  }
</script>

<br />
<br />

<div class="new-task-wrapper">
  <h6>Create a new DMD Task</h6>
  <fieldset class="new-task-fields">
    <!--fieldset>
    <legend>Metadata File Information</legend-->

    <label for="metadata-type">Metadata Type:</label>
    <select name="metadata-type" bind:value={metadataType}>
      <option value="" />
      <option value="issueinfocsv">Issueinfo CSV</option>
      <option value="dccsv">Dublin Core CSV</option>
      <option value="marc490">MARC - ID in 490</option>
      <option value="marcoocihm">MARC - ID in oocihm interpretation</option>
      <option value="marcooe">MARC - ID in ooe interpretation</option>
    </select>
    <span>Metadata File:</span>
    <FileSelector on:change={handleFileSelected} />
    <!--/fieldset-->
  </fieldset>
  <br />
  <br />
  {#if metadataType && b64EncodedMetadataFileText}
    <button class="primary new-task-button" on:click={handleCreateTask}
      >Create Task</button
    >
  {/if}
</div>

<style>
  .new-task-wrapper {
    width: fit-content;
    margin: auto;
  }

  .new-task-fields {
    display: grid;
    grid-template-areas: "a a";
    gap: 2rem;
    align-items: center;
  }

  .new-task-button {
    float: right;
  }
</style>