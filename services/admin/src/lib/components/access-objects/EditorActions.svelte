<!--
@component
### Overview
The editor actions component holds functionality that is responsible for performing actions like saving, deleting, and publishing AccessObjects.

### Properties
|    |    |    |
| -- | -- | -- |
| serverObject: AccessObject        | required | This is the 'original' serverObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed  |
| editorObject: AccessObject   | required | This is a deep copy of the original serverObject, it gets edited as the user makes changes in the editor. It's purpose is to contain the form state for the editors. |

### Usage
```  
<EditorActions bind:serverObject bind:editorObject />
```
*Note: `bind:` is required for changes to the serverObject and its model to be reflected in higher level components.*
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { Session } from "$lib/types";
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import { AccessObject } from "@crkn-rcdr/access-data";
  import { detailedDiff } from "deep-object-diff";
  import { getStores } from "$app/stores";
  import { showConfirmation } from "$lib/confirmation";
  import { checkValidDiff, checkModelChanged } from "$lib/validation";
  import Modal from "$lib/components/shared/Modal.svelte";

  /**
   * @type {AccessObject} This is the 'original' serverObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed.
   */
  export let serverObject: AccessObject;

  /**
   * @type {AccessObject} This is a deep copy of the original serverObject, it gets edited as the user makes changes in the editor. It's purpose is to contain the form state for the editors..
   */
  export let editorObject: AccessObject;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {any} A module that quickly deep copies (clones) an serverObject.
   */
  let clone: any;

  /**
   * @type {boolean} Controls if the save button is displayed or not.
   */
  let isSaveEnabled = false;

  /**
   * @type {boolean} Controls if the move to storage modal is being displayed or not.
   */
  let showUnassignSlugModal = false;

  /**
   * Sets @var isSaveEnabled depending on if the editorObject is valid.
   * @returns void
   */
  function checkEnableSave() {
    isSaveEnabled = checkValidDiff(serverObject, editorObject);
  }

  $: {
    editorObject;
    checkEnableSave();
  }

  /* TODO: ask how to set up an insert request */
  async function sendCreateRequest(data: any) {
    return await showConfirmation(
      async () => {
        try {
          //if(response) goto(`/serverObject/${editorObject["id"]}`);
          return {
            success: true,
            details: "done",
          };
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      `Success! Created ${editorObject.type}.`,
      `Error: couldn't to create ${editorObject.type}.`
    );
  }

  /**
   * Sends the request to save changes to the backend using lapin. Uses @function showConfirmation to display a floating notification with the results of the lapin call. The result of the lapin call is returned.
   * @param data
   * @returns response
   */
  async function sendSaveRequest(data: any) {
    return await showConfirmation(
      async () => {
        try {
          if (
            editorObject.type === "manifest" ||
            editorObject.type === "collection"
          ) {
            const bodyObj = {
              id: editorObject.id,
              user: $session.user,
              data,
            };
            const response = await $session.lapin.mutation(
              `${editorObject.type}.edit`,
              bodyObj
            );
            return {
              success: true,
              details: JSON.stringify(bodyObj),
            };
          }
          return {
            success: false,
            details: "Object not of type canvas or manifest",
          };
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "Success! Changes saved.",
      "Error: failed to save changes."
    );
  }

  async function handleSave() {
    const diff: any = detailedDiff(serverObject, editorObject);

    let bodyObj = {
      ...diff["added"],
      ...diff["updated"],
    };

    // Arrays are handled a bit strange in the diff module. Instead, just assign the entire array to the body data serverObject
    if (bodyObj["canvases"]) {
      bodyObj["canvases"] = editorObject["canvases"];
    }

    const data = await sendSaveRequest(bodyObj);
    if (data) {
      try {
        await pullServerObject();
        checkModelChanged(serverObject, editorObject);
      } catch (e) {
        //error = e;
        console.log(e);
      }
    }
  }

  /**
   * Sends the request to the backend to unnasign a slug from the access serverObject. If it is successful, the serverObject model is deep cloned into the serverObject, and the editor state is updated to reflect the serverObject being a 'Slugless' access serverObject.
   * @returns response
   */
  async function handleUnassignSlug() {
    showUnassignSlugModal = false;
    return await showConfirmation(
      async () => {
        if (
          editorObject.type === "manifest" ||
          editorObject.type === "collection"
        ) {
          try {
            const response = await $session.lapin.mutation(
              `accessObject.unassignSlug`,
              {
                id: editorObject.id,
                user: $session.user,
              }
            );
            await pullServerObject();
            return { success: true, details: "" };
          } catch (e) {
            console.log(e);
            return { success: false, details: e.message };
          }
        }
        return {
          success: false,
          details: "Object not of type canvas or manifest",
        };
      },
      `Success! Unassigned the slug '${editorObject["slug"]}.'`,
      `Error unassigning slug '${editorObject["slug"]}.'`
    );
  }

  /**
   * This method sends the request to the backend to publish or unpublish an object from the platform.
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns response
   */
  async function handlePublishStatusChange() {
    return await showConfirmation(
      async () => {
        if (
          editorObject.type === "manifest" ||
          editorObject.type === "collection"
        ) {
          try {
            if (editorObject["public"]) {
              const response = await $session.lapin.mutation(
                `accessObject.unpublish`,
                {
                  id: editorObject.id,
                  user: $session.user,
                }
              );
            } else {
              const response = await $session.lapin.mutation(
                `accessObject.publish`,
                {
                  id: editorObject.id,
                  user: $session.user,
                }
              );
            }
            await pullServerObject();
            return {
              success: true,
              details: JSON.stringify(serverObject),
            };
          } catch (e) {
            console.log(e);
            return { success: false, details: e.message };
          }
        }
        return {
          success: false,
          details: "Object not of type canvas or manifest",
        };
      },
      `Success! ${editorObject["public"] ? "Unublish" : "Publish"}ed ${
        editorObject["type"]
      }.`,
      `Error: Couldn't publish ${editorObject["type"]}.`
    );
  }

  /**
   * This method pulls the 'serverObject' from the backend. This resets the form and ensures that any problems saving changes are caught.
   * @returns void
   */
  async function pullServerObject() {
    try {
      const response = await $session.lapin.query(
        "accessObject.get",
        serverObject["id"]
      );
      serverObject = AccessObject.parse(response);
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, the 'clone' variable is set to the rfdc module.
   */
  onMount(async () => {
    clone = (await import("rfdc")).default();
  });

  /**
   * @listens editorObject
   * @description A reactive code block that is executed any time the @var editorObject changes. It calls @function checkEnableSave, to hide or show the save button depending on the validity of the editorObject (if nothing has been changed, the save button also gets hidden.)
   */
  $: {
    editorObject;
    checkEnableSave();
  }
</script>

<span class="editor-actions auto-align auto-align__a-center">
  {#if isSaveEnabled}
    <button class="save" on:click={handleSave}>Save</button>
  {/if}
  <button class="secondary" on:click={handlePublishStatusChange}
    >{serverObject["public"] ? "Unpublish" : "Publish"}</button
  >

  {#if serverObject["slug"]}
    <button
      class="danger icon-button"
      data-tooltip="Unassign Slug"
      data-tooltip-flow="bottom"
      on:click={() => (showUnassignSlugModal = true)}
    >
      <div class="button-icon">
        <FaArchive />
      </div>
    </button>
  {/if}
</span>

<Modal
  bind:open={showUnassignSlugModal}
  title={`Are you sure you want to unassign this slug?`}
>
  <p slot="body">
    By unassigning this serverObject's slug, you will be taking it out of all
    the collections it belongs to. You can then use the slug, '{serverObject[
      "slug"
    ]}' for other serverObjects. Objects that do not have a slug assigned to
    them are effectively undiscoverable. You can bookmark this page to access
    this serverObject again in the future. You can assign it a new slug to make
    it discoverable in the platform again.
  </p>
  <div slot="footer">
    <button class="secondary" on:click={() => (showUnassignSlugModal = false)}>
      Cancel
    </button>
    <button class="danger" on:click={handleUnassignSlug}>
      Unassign Slug
    </button>
  </div>
</Modal>

<style>
  button {
    margin-left: var(--margin-sm);
  }
</style>
