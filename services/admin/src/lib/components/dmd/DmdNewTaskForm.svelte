<!--
@component
### Overview
This component allows the user to create new DMD tasks to attach metadata to objects. The metadata and objects are specified by a file that is selected from their computer.

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
  import NotificationBar from "../shared/NotificationBar.svelte";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {"csvissueinfo" | "csvdc" | "marc490" | "marcoocihm" | "marcooe"} Used to tell the dmdtask deamons what kind of metadata format the metadata being processed is in.
   */
  let metadataType:
    | "csvissueinfo"
    | "csvdc"
    | "marc490"
    | "marcoocihm"
    | "marcooe";

  /**
   * @type {string | undefined} This is the base 64 encoded string for the metadata file that will be stored in the couch attachment.
   */
  let b64EncodedMetadataFileText: string | undefined = undefined;

  /**
   * @type {string } Thiis variable is used to show any error with the user's selections to them.
   */
  let errorText: string = "";

  /**
   * Converts the selected file into a base 64 encoded string and stores it in the @var b64EncodedMetadataFileText
   * @returns void
   */
  async function handleFileSelected(event: any) {
    const file: File = event.detail;
    const metadataFileText = await file.text();
    try {
      if (metadataFileText) {
        b64EncodedMetadataFileText = btoa(metadataFileText);
      }
    } catch (e) {
      console.log(e);
      errorText =
        "There was a formatting problem with your file. Please fix it or choose another file.";
    }
  }

  /**
   * TODO: will send the create request to lapin
   * @returns void
   */
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
  <NotificationBar message={errorText} status="fail" />
  <br />
  <fieldset class="new-task-fields">
    <label for="metadata-type">Metadata Type:</label>
    <select name="metadata-type" bind:value={metadataType}>
      <option value="" />
      <option value="csvissueinfo">Issueinfo CSV</option>
      <option value="csvdc">Dublin Core CSV</option>
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
