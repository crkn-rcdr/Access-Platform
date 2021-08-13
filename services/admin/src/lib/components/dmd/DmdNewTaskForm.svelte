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
  import { goto } from "$app/navigation";
  import { showConfirmation } from "$lib/confirmation";

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
   * @type {string} This is the base 64 encoded string for the metadata file that will be stored in the couch attachment.
   */
  let b64EncodedMetadataFileText: string;

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
        "There was a formatting problem with the metadata file. Please fix it or choose another file.";
    }
  }

  /**
   * Sends the create request to lapin. Uses @function showConfirmation to show a notification at the bottom right of the screen saying if the request was sucessful or not. If it is a success, it uses the @function goto ith the DMD task id passed as the response from the request in the url.
   * @returns void
   */
  async function handleCreateTask() {
    await showConfirmation(
      async () => {
        try {
          const bodyObj = {
            user: $session.user,
            mdType: metadataType,
            file: b64EncodedMetadataFileText,
          };
          const response = await $session.lapin.mutation(
            `dmdTask.create`,
            bodyObj
          );
          if (response) {
            goto(`/dmd/${response}`);
            return {
              success: true,
              details: response,
            };
          } else {
            return {
              success: false,
              details: response,
            };
          }
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "Success! Metadata upload request created.",
      "Error: Metadata upload request failed."
    );
  }
</script>

<br />
<br />

<div class="new-task-wrapper">
  <h6>Start a new Metadata Upload</h6>
  <NotificationBar message={errorText} status="fail" />
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
  {#if metadataType && b64EncodedMetadataFileText}
    <button class="primary new-task-button" on:click={handleCreateTask}
      >Start Upload</button
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
