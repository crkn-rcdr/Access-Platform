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
  import type {
    AccessObject,
    NewCollection,
    NewManifest,
  } from "@crkn-rcdr/access-data";
  import { getStores } from "$app/stores";
  import { showConfirmation } from "$lib/utils/confirmation";
  import { checkValidDiff } from "$lib/utils/validation";
  import Modal from "$lib/components/shared/Modal.svelte";
  import { goto } from "$app/navigation";

  /**
   * @type {AccessObject} This is th$lib/utils/confirmationerObject of type AccessObject pulled from the backend, to be edited only once an action is successfully performed.
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
   * @type {"create" | "edit"} An indicator variable if the editor is in create mode or edit mode.
   */
  let mode: "create" | "edit";

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
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * Sets @var isSaveEnabled depending on if the editorObject is valid.
   * @returns void
   */
  function checkEnableSave() {
    isSaveEnabled =
      mode === "create" && checkValidDiff(serverObject, editorObject);
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
            const response = await $session.lapin.mutation(`manifest.new`, {
              user: $session.user,
              data: editorObject as NewManifest,
            });
            goto(`/object/${response}`);
            return {
              success: true,
              details: response,
            };
          } else if (editorObject.type === "collection") {
            const response = await $session.lapin.mutation(`collection.new`, {
              user: $session.user,
              data: editorObject as NewCollection,
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
   * @event onMount
   * @description When the component instance is mounted onto the dom, the 'clone' variable is set to the rfdc module.
   */
  onMount(async () => {
    clone = (await import("rfdc")).default();
  });
</script>

<span class="editor-actions auto-align auto-align__a-center">
  {#if isSaveEnabled}
    <button class="save" on:click={handleSaveCreate}>Save</button>
  {/if}
  <button class="secondary" on:click={handlePublishStatusChange}>
    {serverObject["public"] ? "Unpublish" : "Publish"}
  </button>

  {#if serverObject["slug"]}
    <button
      class="danger"
      data-tooltip="Unassign Slug"
      data-tooltip-flow="bottom"
      on:click={() => (showUnassignSlugModal = true)}
    >
      Unassign Slug
    </button>
  {/if}
</span>

<Modal
  bind:open={showUnassignSlugModal}
  title={`Are you sure you want to unassign this slug?`}
>
  <p slot="body">
    By unassigning this {serverObject.type}'s slug, you will be taking it out of
    all the collections it belongs to. You will also be unpublishing the {serverObject.type}.
    You can then use the slug, '{serverObject["slug"]}' for other manifests or
    collections. Manifests and collections that do not have a slug assigned to
    them are undiscoverable. You can bookmark this page to access this {serverObject.type}
    again in the future. You can assign it a new slug, and publish it, to make it
    discoverable on the platform again.
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
