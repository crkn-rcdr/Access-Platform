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

  const { session } = getStores<Session>();

  export let object: AccessObject;
  export let objectModel: AccessObject;

  let clone: any;
  let isSaveEnabled = false;
  let showMovetoStorageModal = false;

  function checkEnableSave() {
    isSaveEnabled = checkValidDiff(object, objectModel);
  }

  $: {
    objectModel;
    checkEnableSave();
  }

  /* TODO: ask how to set up an insert request */
  async function sendCreateRequest(data: any) {
    return await showConfirmation(
      async () => {
        try {
          //if(response) goto(`/object/${objectModel["id"]}`);
          return true;
        } catch (e) {
          return e;
        }
      },
      `${objectModel.type} created!`,
      `Failed to create ${objectModel.type}.`
    );
  }

  async function sendSaveRequest(data: any) {
    return await showConfirmation(
      async () => {
        try {
          if (
            objectModel.type === "manifest" ||
            objectModel.type === "collection"
          ) {
            const bodyObj = {
              id: objectModel.id,
              user: $session.user,
              data,
            };
            console.log("bodyObj", bodyObj);
            const response = await $session.lapin.mutation(
              `${objectModel.type}.edit`,
              bodyObj
            );
            console.log("res", response);
            return true;
          }
          return false;
        } catch (e) {
          return e;
        }
      },
      "Changes saved!",
      "Failed to save changes."
    );
  }

  async function handleSave() {
    const diff: any = detailedDiff(object, objectModel); //TODO: We can send this to the backend

    let bodyObj = {
      ...diff["added"],
      ...diff["updated"],
    };

    if (bodyObj["canvases"]) {
      bodyObj["canvases"] = objectModel["canvases"];
    }

    /* const data = objectModel?.id?.length
      ? await sendSaveRequest(bodyObj)
      : await sendCreateRequest(bodyObj); */
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

  /* TODO: ask what the best way to set this to undefined is, because it seems like undefined params get trimmed from the data object */
  async function handlePlaceInStorage() {
    showMovetoStorageModal = false;
    return await showConfirmation(
      async () => {
        if (
          objectModel.type === "manifest" ||
          objectModel.type === "collection"
        ) {
          try {
            const response = await $session.lapin.mutation(
              `${objectModel.type}.edit`,
              {
                id: objectModel.id,
                user: $session.user,
                data: {
                  slug: "",
                },
              }
            );
            console.log("res", response);
            if (response) {
              objectModel["slug"] = undefined;
              object = clone(objectModel) as AccessObject; // todo: get this done with zod
            }
            return true;
          } catch (e) {
            //error = e;
            console.log(e);
          }
        }
        return false;
      },
      "success",
      "fail"
    );
  }

  function handlePublishStatusChange() {}

  onMount(async () => {
    clone = (await import("rfdc")).default();
  });
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
