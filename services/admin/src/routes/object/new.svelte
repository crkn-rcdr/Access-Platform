<script lang="ts">
  /**
   * @file
   * @description This page shows the editor for creating a new serverObject.
   */
  import type {
    AccessObject,
    NewCollection,
    NewManifest,
  } from "@crkn-rcdr/access-data";
  //import type { Manifest, Collection } from "@crkn-rcdr/access-data";
  import Editor from "$lib/components/access-objects/Editor.svelte";

  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {AccessObject} Object being created.
   */
  let serverObject: AccessObject;

  //TODO: call niod service to generate id in the backend

  /**
   * Sets the @var serverObject to a new Collection type serverObject
   * @returns void
   */
  async function handleNewCollectionPressed() {
    let newCollection: NewCollection = {
      slug: "2132",
      label: {
        value: "nothing 1",
      },
      type: "collection",
      behavior: "unordered",
      members: [],
    };
    const res = await $session.lapin.mutation("collection.create", {
      user: $session.user,
      data: newCollection,
    });
    console.log("Test Collection Create: ", res);
  }

  /**
   * Sets the @var serverObject to a new Manifest type serverObject
   * @returns void
   */
  async function handleNewManifestPressed() {
    let newManifest: NewManifest = {
      slug: "12354",
      label: {
        value: "nothing 2",
      },
      type: "manifest",
      from: "canvases",
      canvases: [],
    };
    const res = await $session.lapin.mutation("manifest.create", {
      user: $session.user,
      data: newManifest,
    });
    console.log("Test Manifest Create: ", res);
  }
</script>

{#if serverObject}
  <Editor bind:serverObject />
{:else}
  <div class="wrapper">
    <div
      class="obect-type-select auto-align auto-align__column auto-align__j-center  auto-align__a-center"
    >
      <h6>Create a new:</h6>
      <button class="primary" on:click={handleNewCollectionPressed}
        >Collection</button
      >
      <button class="primary" on:click={handleNewManifestPressed}
        >Manifest</button
      >
    </div>
  </div>
{/if}

<style>
  .obect-type-select {
    width: 100%;
  }
  .obect-type-select > * {
    margin-bottom: 1rem;
  }
</style>
