<script lang="ts">
  import FaArchive from "svelte-icons/fa/FaArchive.svelte";
  import { AccessObject } from "@crkn-rcdr/access-data";
  import equal from "fast-deep-equal";
  import { detailedDiff } from "deep-object-diff";
  import Modal from "$lib/components/shared/Modal.svelte";

  export let object: AccessObject;
  export let objectModel: AccessObject;

  let rfdc: any; // Deep copies an object
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
    const response = await fetch(`/object/save`, {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify({
        id: objectModel.id,
        data,
      }),
    });
    console.log("save res:", response);
    if (response.status === 200) return await response.json();
    return null;
  }

  async function handleSave() {
    let diff: any = detailedDiff(object, objectModel); //TODO: We can send this to the backend
    console.log("diff", diff);

    rfdc = (await import("rfdc")).default();
    // might need 'deleted'
    const data = await sendSaveRequest({
      ...diff["added"],
      ...diff["updated"],
    });
    try {
      object = rfdc(objectModel) as AccessObject; // todo: get this done with zod
      checkModelChanged(objectModel);
      console.log("RES", data);
    } catch (e) {
      //error = e;
      console.log(e);
    }
  }

  function handlePlaceInStorage() {
    showMovetoStorageModal = false;
    objectModel["slug"] = undefined;
    handleSave().then(() => {
      console.log("Done saving");
    });
  }

  function handlePublishStatusChange() {}
</script>

<span class="editor-actions auto-align auto-align__a-center">
  {#if handleSaveEnabled}
    <button
      class="save"
      on:click={() => {
        handleSave().then(() => {
          console.log("Done saving");
        });
      }}>Save</button
    >
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
