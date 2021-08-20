<!--
@component
### Overview
This component allows the user to create new DMD tasks to attach metadata to objects. The metadata and objects are specified by a file that is selected from their computer.

Import metadata 
Operator should be able to go to the page for an existing Object, and import into the metadata from a file that was exported from other tools (List of import formats will grow): 
CSV files (where specific format chosen in pull-down for pre-defined formats) 
DB/TExt XML dump 
MARC xml file 

Similar to adding processing requests to an object, but would be applied to all objects whose directory of files are placed in the group directory prior to the group directory being moved to the wip/Inbox directory. Processing requests would be appended to the processing requests that already existed for each object. 7

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
  import LoadingButton from "$lib/components/shared/LoadingButton.svelte";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  let state: "ready" | "uploading" | "uploaded" | "error" = "ready";

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
      /**
       * @see https://stackoverflow.com/questions/23223718/failed-to-execute-btoa-on-window-the-string-to-be-encoded-contains-characte
       * to decode: function b64_to_utf8( str ) {
              str = str.replace(/\s/g, '');    
              return decodeURIComponent(escape(window.atob( str )));
          }
      */
      if (metadataFileText) {
        b64EncodedMetadataFileText = btoa(
          unescape(encodeURIComponent(metadataFileText))
        );
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
    state = "uploading";
    await showConfirmation(
      async () => {
        try {
          const bodyObj = {
            user: $session.user,
            format: metadataType,
            file: b64EncodedMetadataFileText,
          };
          const response = await $session.lapin.mutation(
            `dmdTask.create`,
            bodyObj
          );
          if (response) {
            state = "uploaded";
            goto(`/dmd/${response}`);
            return {
              success: true,
              details: response,
            };
          } else {
            state = "error";
            return {
              success: false,
              details: response,
            };
          }
        } catch (e) {
          state = "error";
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "Success! Metadata file sent for processing.",
      "Error: Metadata upload request failed."
    );
  }
</script>

<p class="new-task-instructions">
  Please select the type of file you would like to use to perform the
  descriptive metadata update with, and attach the file from your computer.
</p>
<br />
<div class="new-task-wrapper">
  <NotificationBar message={errorText} status="fail" />
  <fieldset class="new-task-fields">
    <label for="metadata-type">Metadata File Type:</label>
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
  </fieldset>
  <br />
  {#if metadataType && b64EncodedMetadataFileText}
    <div class="new-task-button">
      <LoadingButton
        buttonClass="primary"
        showLoader={state === "uploading"}
        on:clicked={handleCreateTask}
      >
        <span slot="content">
          {state !== "ready"
            ? state === "uploading"
              ? "Uploading..."
              : "Uploaded!"
            : "Upload File for Processing"}
        </span>
      </LoadingButton>
    </div>
  {/if}
</div>

<style>
  .new-task-instructions {
    max-width: 45rem;
    margin: auto;
  }
  .new-task-wrapper {
    width: fit-content;
    margin: auto;
    min-width: 45rem;
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
