<!--
@component
### Overview
The editor actions component holds functionality that is responsible for performing actions like saving, deleting, and publishing AccessObjects.

### Properties
|    |    |    |
| -- | -- | -- |
| object: AccessObject        | required | This is the 'original' object of type AccessObject pulled from the backend, to be edited only once an action is successfully performed  |
| objectModel: AccessObject   | required | This is a deep copy of the original object, it gets edited as the user makes changes in the editor. It's purpose is to contain the form state for the editors. |

### Usage
```  
<EditorActions bind:object bind:objectModel />
```
*Note: `bind:` is required for changes to the object and its model to be reflected in higher level components.*
-->
<script lang="ts">
  import { onMount } from "svelte";
  import type { Session } from "$lib/types";
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { detailedDiff } from "deep-object-diff";
  import { getStores } from "$app/stores";
  import { goto } from "$app/navigation";
  import { showConfirmation } from "$lib/confirmation";
  import { checkValidDiff, checkModelChanged } from "$lib/validation";
  import Modal from "$lib/components/shared/Modal.svelte";

  /**
   * @type {AccessObject} This is the 'original' object of type AccessObject pulled from the backend, to be edited only once an action is successfully performed.
   */
  export let object: AccessObject;

  /**
   * @type {AccessObject} This is a deep copy of the original object, it gets edited as the user makes changes in the editor. It's purpose is to contain the form state for the editors..
   */
  export let objectModel: AccessObject;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {any} A module that quickly deep copies (clones) an object.
   */
  let clone: any;

  /**
   * @type {boolean} Controls if the save button is displayed or not.
   */
  let isSaveEnabled = false;

  /**
   * @type {boolean} Controls if the move to storage modal is being displayed or not.
   */
  let showMovetoStorageModal = false;

  /**
   * Sets @var isSaveEnabled depending on if the objectModel is valid.
   * @returns void
   */
  function checkEnableSave() {
    isSaveEnabled = checkValidDiff(object, objectModel);
  }

  /**
   * Sends the request to save changes to the backend using lapin. Uses @function showConfirmation to display a floating notification with the results of the lapin call. The result of the lapin call is returned.
   * @param data
   * @returns response
   */
  async function sendSaveRequest(data: any) {
    //todo make partial of type
    let newlyCreated = false;
    const response = await showConfirmation(
      async () => {
        if (objectModel?.id?.length) {
          const bodyObj = {
            id: objectModel.id,
            data,
          };
          return await $session.lapin.mutation("object.insert", bodyObj);
        } else {
          const bodyObj = {
            data: objectModel,
          };
          if (
            objectModel["type"] === "collection" ||
            objectModel["type"] === "manifest"
          ) {
            //todo assign id in backend
            objectModel["id"] =
              objectModel["type"] === "collection"
                ? "69429/s038383832838"
                : "69429/m038383832838";

            const res = await $session.lapin.mutation(
              `object.${objectModel["type"]}Insert`,
              bodyObj
            );
            if (res) newlyCreated = true;
            return res;
          } else throw "Object not a collection or a manifest";
        }
      },
      "Changes saved!",
      "Failed to save changes."
    );

    if (newlyCreated) goto(`/object/${objectModel["id"]}`);
    return response;
  }

  /**
   * Is called when the use presses the green save button. It cakks @function sendSaveRequest and if it succeeds, it deep clones the object model into the original object, resetung the editor state with the new changes.
   */
  async function handleSave() {
    const diff: any = detailedDiff(object, objectModel);

    let bodyObj = {
      ...diff["added"],
      ...diff["updated"],
    };

    // Arrays are handled a bit strange in the diff module. Instead, just assign the entire array to the body data object
    if (bodyObj["canvases"]) {
      bodyObj["canvases"] = objectModel["canvases"];
    }

    const data = await sendSaveRequest(bodyObj);

    if (data) {
      try {
        clone = (await import("rfdc")).default();
        object = clone(objectModel) as AccessObject; // todo: get this done with zod
        checkModelChanged(object, objectModel);
      } catch (e) {
        //error = e;
        console.log(e);
      }
    }
  }

  /**
   * Sends the request to the backend to unnasign a slug from the access object. If it is successful, the object model is deep cloned into the object, and the editor state is updated to reflect the object being a 'Slugless' access object.
   * @returns response
   */
  async function handlePlaceInStorage() {
    showMovetoStorageModal = false;
    const response = await showConfirmation(
      async () => {
        return await $session.lapin.query(
          "noid.unassignSlug",
          objectModel["id"]
        );
      },
      "success",
      "fail"
    );
    objectModel["slug"] = undefined;
    object = clone(objectModel) as AccessObject; // todo: get this done with zod
    return response;
  }

  /**
   * TODO
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function handlePublishStatusChange() {}

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, the 'clone' variable is set to the rfdc module.
   */
  onMount(async () => {
    clone = (await import("rfdc")).default();
  });

  /**
   * @listens objectModel
   * @description A reactive code block that is executed any time the @var objectModel changes. It calls @function checkEnableSave, to hide or show the save button depending on the validity of the objectModel (if nothing has been changed, the save button also gets hidden.)
   */
  $: {
    objectModel;
    checkEnableSave();
  }
</script>

<span class="editor-actions auto-align auto-align__a-center">
  {#if isSaveEnabled}
    <button class="save" on:click={handleSave}>Save</button>
  {/if}
  <button class="secondary" on:click={handlePublishStatusChange}
    >{object["public"] ? "Unpublish" : "Publish"}</button
  >

  {#if object["slug"]}
    <button
      class="danger icon-button"
      data-tooltip="Place in storage"
      data-tooltip-flow="bottom"
      on:click={() => (showMovetoStorageModal = true)}
    >
      <div class="button-icon">
        <FaArchive />
      </div>
    </button>
  {/if}
</span>

<Modal
  bind:open={showMovetoStorageModal}
  title={`Are you sure you want to place this object in storage?`}
>
  <p slot="body">
    By placing this object in storage you will be taking it out of all the
    collections it belongs to. You will be unassigning its slug, '{object[
      "slug"
    ]}.' You can then use that slug for other objects. Objects that do not have
    a slug assigned to them are effectively undiscoverable. You can bookmark
    this page to access this object again in the future. You can assign it a new
    slug to make it discoverable in the platform again.
    <!--You'll be able to view
    {object["slug"]} in storage and add it back into the platform
    <a href="/storage" target="_blank">here.</a-->
  </p>
  <div slot="footer">
    <button class="secondary" on:click={() => (showMovetoStorageModal = false)}>
      Cancel
    </button>
    <button class="danger" on:click={handlePlaceInStorage}>
      Place in storage
    </button>
  </div>
</Modal>

<style>
  button {
    margin-left: var(--margin-sm);
  }
</style>
