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
  import { createEventDispatcher, onMount } from "svelte";
  import type { Session } from "$lib/types";
  import type { PagedAccessObject } from "@crkn-rcdr/access-data";
  import type { NewCollection, NewManifest } from "@crkn-rcdr/access-data";
  import { getStores } from "$app/stores";
  import { showConfirmation } from "$lib/utils/confirmation";
  import { checkValidDiff } from "$lib/utils/validation";
  import Modal from "$lib/components/shared/Modal.svelte";
  import { goto } from "$app/navigation";
  import Loading from "../shared/Loading.svelte";

  /**
   * This is th$lib/utils/confirmationerObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed.
   */
  export let serverObject: PagedAccessObject;
  /**
   * The AccessObject editorObject that will be manipulated by the user, usually, a copy of an access pbject that acts as a form model.
   */
  export let editorObject: PagedAccessObject;
  /**
   * @type {"create" | "edit"} An indicator variable if the editor is in create mode or edit mode.
   */
  export let mode: "create" | "edit";

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
  let showDeleteModal = false;

  /**
   * @type {string} Used to show a message to the user when delete is pressed.
   */
  let deleteModalTitle = "";

  /**
   * @type {string} Used to show a message to the user when delete is pressed.
   */
  let deleteModalMsg = "";

  let deleteModalActionText = "";

  let isDeleteModalWaiting = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Sets @var isSaveEnabled depending on if the editorObject is valid.
   * @returns void
   */
  function checkEnableSave() {
    const diff = checkValidDiff(serverObject, editorObject);
    isSaveEnabled = mode === "create" && diff;
  }

  $: {
    editorObject;
    checkEnableSave();
  }

  $: {
    mode = serverObject?.id ? "edit" : "create";
  }

  async function handleSaveCreate() {
    await showConfirmation(
      async () => {
        try {
          if (editorObject.type === "manifest") {
            const data: NewManifest = {
              slug: editorObject.slug,
              summary: editorObject.summary,
              behavior: editorObject.behavior,
              canvases: [], //editorObject.canvases || [],
              viewingDirection: editorObject.viewingDirection,
              type: editorObject.type,
              label: editorObject.label,
            };
            const response = await $session.lapin.mutation(`manifest.new`, {
              user: $session.user,
              data,
            });
            goto(`/object/${response}`);
            return {
              success: true,
              details: response,
            };
          } else if (editorObject.type === "collection") {
            const data: NewCollection = {
              slug: editorObject.slug,
              summary: editorObject.summary,
              type: editorObject.type,
              label: editorObject.label,
              behavior: editorObject.behavior,
              members: [],
            };
            const response = await $session.lapin.mutation(`collection.new`, {
              user: $session.user,
              data,
            });
            goto(`/object/${response}`);
            return {
              success: true,
              details: response,
            };
          } else
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

  /**
   * Sends the request to the backend to unnasign a slug from the access serverObject. If it is successful, the serverObject model is deep cloned into the serverObject, and the editor state is updated to reflect the serverObject being a 'Slugless' access serverObject.
   * @returns response
   */
  async function handleDelete() {
    showDeleteModal = false;
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
            dispatch("updated");
            //await pullServerObject();
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
      `Success! Deleted '${editorObject["slug"]}.'`,
      `Error deleting '${editorObject["slug"]}.'`
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
            if (editorObject.public) {
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
            dispatch("updated");
            //await pullServerObject();
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
      `Error: could not publish ${editorObject["type"]}.`
    );
  }

  /**
   * This method pulls the 'serverObject' from the backend. This resets the form and ensures that any problems saving changes are caught.
   * @returns void
   */
  async function pullServerObject() {
    try {
      const response = await $session.lapin.query(
        "accessObject.getPaged",
        serverObject["id"]
      );
      serverObject = response;
    } catch (e) {
      console.log(e);
    }
  }

  function setDeletionModalTextEnabled() {
    deleteModalTitle = `Are you sure you want to delete ${serverObject["slug"]}?`;
    deleteModalMsg = `By deleting ${serverObject["slug"]}, you will be taking it out of all the collections it belongs to. You will be able to use the slug, "${serverObject["slug"]}", for future ${serverObject["type"]}s. You can add ${serverObject["slug"]} back into the access platform by importing it from preservation again.`;
    deleteModalActionText = `Delete`;
  }

  function setDeletionModalTextWaiting() {
    deleteModalTitle = `${serverObject["slug"]} can't be deleted yet.`;
    deleteModalMsg = `There are background processes running preventing ${serverObject["slug"]} from being deleted. Please wait...`;
    deleteModalActionText = `Ok`;
  }

  function setDeletionModalTextTryAgain() {
    console.log("No tries left");
    deleteModalTitle = `${serverObject["slug"]} can not be deleted.`;
    deleteModalMsg = `Can not delete ${serverObject["slug"]}. There are background processes running on ${serverObject["slug"]}. Please wait and try again later.`;
    deleteModalActionText = `Ok`;
  }

  function setDeletionModalTextError() {
    deleteModalTitle = `${serverObject["slug"]} can't be deleted.`;
    deleteModalMsg = `There was a problem when  background processes ran that is preventing ${serverObject["slug"]} from being deleted. Message: ${serverObject["updateInternalmeta"]?.["message"]}`;
    deleteModalActionText = `Ok`;
  }

  async function openDeletionModal() {
    if (
      !serverObject.updateInternalmeta ||
      "succeeded" in serverObject.updateInternalmeta
    ) {
      if (serverObject.updateInternalmeta["succeeded"]) {
        isDeleteModalWaiting = false;
        setDeletionModalTextEnabled();
      } else {
        isDeleteModalWaiting = false;
        setDeletionModalTextError();
      }
    } else {
      isDeleteModalWaiting = true;
      setDeletionModalTextWaiting();

      (function requestLoop(i) {
        setTimeout(async () => {
          isDeleteModalWaiting = true;
          console.log("pulling serverObject");
          await pullServerObject();
          console.log("pulled!", serverObject);
          if ("succeeded" in serverObject.updateInternalmeta) {
            if (serverObject.updateInternalmeta["succeeded"]) {
              isDeleteModalWaiting = false;
              setDeletionModalTextEnabled();
            } else {
              isDeleteModalWaiting = false;
              setDeletionModalTextError();
            }
          } else {
            console.log("Update not done");
            //isDeleteModalWaiting = true;
            //setDeletionModalTextWaiting();
            if (--i) {
              console.log("More tries left");
              requestLoop(i);
            } else {
              isDeleteModalWaiting = false;
              setDeletionModalTextTryAgain();
            }
          }
        }, 30000);
      })(30);
    }

    showDeleteModal = true;
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, the 'clone' variable is set to the rfdc module.
   */
  onMount(async () => {
    clone = (await import("rfdc")).default();
  });
</script>

<span class="editor-actions auto-align auto-align__a-center">
  {#if isSaveEnabled}
    <button class="save" on:click={handleSaveCreate}>Create</button>
  {/if}

  {#if editorObject["id"]}
    <button class="secondary" on:click={handlePublishStatusChange}>
      {serverObject["public"] ? "Unpublish" : "Publish"}
    </button>

    {#if serverObject["slug"] && !serverObject["public"]}
      <button
        class="danger"
        data-tooltip="Delete"
        data-tooltip-flow="bottom"
        on:click={openDeletionModal}
      >
        Delete
      </button>
    {/if}
  {/if}
</span>

<Modal bind:open={showDeleteModal} title={deleteModalTitle}>
  <div slot="body">
    {#if isDeleteModalWaiting}
      {deleteModalMsg}
      <br />
      <br />
      <div class="modal-loader-wrap">
        <Loading backgroundType="gradient" />
      </div>
    {:else}
      <p>{deleteModalMsg}</p>
    {/if}
  </div>
  <div slot="footer">
    <button class="secondary" on:click={() => (showDeleteModal = false)}>
      Cancel
    </button>
    {#if !isDeleteModalWaiting}
      {#if deleteModalActionText === "Ok"}
        <button
          class="primary"
          on:click={() => {
            showDeleteModal = false;
          }}
        >
          {deleteModalActionText}
        </button>
      {:else}
        <button class="danger" on:click={handleDelete}>
          {deleteModalActionText}
        </button>
      {/if}
    {/if}
  </div>
</Modal>

<style>
  button {
    margin-left: var(--margin-sm);
  }
  /* .centered-modal-content, */
  .modal-loader-wrap {
    text-align: center;
  }
  .modal-loader-wrap {
    height: 5rem;
  }
</style>
