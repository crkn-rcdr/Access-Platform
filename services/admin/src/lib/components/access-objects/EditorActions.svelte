<script lang="ts">
  import { session } from "$app/stores";
  import { getLapin } from "$lib/lapin";
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { onMount } from "svelte";
  import equal from "fast-deep-equal";
  import { detailedDiff } from "deep-object-diff";
  import Modal from "$lib/components/shared/Modal.svelte";
  import { showConfirmation } from "$lib/confirmation";

  export let object: AccessObject;
  export let objectModel: AccessObject;

  const lapin = getLapin({ url: $session["apiEndpoint"], fetch: null });
  let clone: any;
  let handleSaveEnabled = false;
  let showMovetoStorageModal = false;

  function checkModelChanged(objectModel: AccessObject) {
    handleSaveEnabled = !equal(object, objectModel);
  }

  $: {
    checkModelChanged(objectModel);
  }

  async function sendSaveRequest(data: any) {
    //todo make partial of type
    console.log("diff", data);
    const response = await showConfirmation(
      async () => {
        const bodyObj = {
          id: objectModel.id,
          data,
        };
        return await lapin.mutation("object.insert", bodyObj);
      },
      "success",
      "fail"
    );
    return response;
  }

  async function handleSave() {
    let diff: any = detailedDiff(object, objectModel); //TODO: We can send this to the backend
    console.log("diff", diff);

    clone = (await import("rfdc")).default();
    // might need 'deleted'
    const data = await sendSaveRequest({
      ...diff["added"],
      ...diff["updated"],
      // foo: "bar", uncomment to test error
    });
    if (data) {
      try {
        object = clone(objectModel) as AccessObject; // todo: get this done with zod
        checkModelChanged(objectModel);
        console.log("RES", data);
      } catch (e) {
        //error = e;
        console.log(e);
      }
    }
  }
  async function handlePlaceInStorage() {
    showMovetoStorageModal = false;
    delete objectModel["slug"];
    console.log("objectModel", objectModel);
    const response = await showConfirmation(
      async () => {
        return await lapin.mutation("object.replace", objectModel);
      },
      "success",
      "fail"
    );
    return response;
  }

  function handlePublishStatusChange() {}

  onMount(async () => {
    clone = (await import("rfdc")).default();
  });
</script>

<span class="editor-actions auto-align auto-align__a-center">
  {#if handleSaveEnabled}
    <button class="save" on:click={handleSave}>Save</button>
  {/if}
  <button class="secondary" on:click={handlePublishStatusChange}
    >{object["public"] ? "Unpublish" : "Publish"}</button
  >

  {#if objectModel["slug"]}
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
