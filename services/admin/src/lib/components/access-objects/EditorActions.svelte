<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { onMount } from "svelte";
  import { detailedDiff } from "deep-object-diff";
  import Modal from "$lib/components/shared/Modal.svelte";
  import { showConfirmation } from "$lib/confirmation";
  import { checkValidDiff, checkModelChanged } from "$lib/validation";
  import { goto } from "$app/navigation";

  /**
   * @type {string} Slug being resolved.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} Slug being resolved.
   */
  export let object: AccessObject;

  /**
   * @type {string} Slug being resolved.
   */
  export let objectModel: AccessObject;

  /**
   * @type {string} Slug being resolved.
   */
  let clone: any;

  /**
   * @type {string} Slug being resolved.
   */
  let isSaveEnabled = false;

  /**
   * @type {string} Slug being resolved.
   */
  let showMovetoStorageModal = false;

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function checkEnableSave() {
    isSaveEnabled = checkValidDiff(object, objectModel);
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  async function sendSaveRequest(data: any) {
    //todo make partial of type
    console.log("diff", data);
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
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  // TODO: check valid manifest or canvas before showing save button
  async function handleSave() {
    const diff: any = detailedDiff(object, objectModel); //TODO: We can send this to the backend

    let bodyObj = {
      ...diff["added"],
      ...diff["updated"],
    };

    if (bodyObj["canvases"]) {
      bodyObj["canvases"] = objectModel["canvases"];
    }

    // might need 'deleted'
    const data = await sendSaveRequest(bodyObj);

    if (data) {
      try {
        clone = (await import("rfdc")).default();
        object = clone(objectModel) as AccessObject; // todo: get this done with zod
        checkModelChanged(object, objectModel);
        console.log("RES", data);
      } catch (e) {
        //error = e;
        console.log(e);
      }
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  async function handlePlaceInStorage() {
    showMovetoStorageModal = false;
    console.log("objectModel 1", objectModel);
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
    console.log("objectModel 2", objectModel);
    return response;
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function handlePublishStatusChange() {}

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  onMount(async () => {
    clone = (await import("rfdc")).default();
  });

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
