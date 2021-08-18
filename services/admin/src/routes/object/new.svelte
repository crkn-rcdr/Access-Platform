<script lang="ts">
  /**
   * @file
   * @description This page shows the editor for creating a new serverObject.
   */
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import type { Manifest, Collection } from "@crkn-rcdr/access-data";
  import Editor from "$lib/components/access-objects/Editor.svelte";

  /**
   * @type {AccessObject} Object being created.
   */
  let serverObject: AccessObject;

  //TODO: call niod service to generate id in the backend

  /**
   * Sets the @var serverObject to a new Collection type serverObject
   * @returns void
   */
  function handleNewCollectionPressed() {
    let newCollection: Collection = {
      id: "",
      slug: "",
      label: {
        value: "",
      },
      type: "collection",
      behavior: "unordered",
      members: [],
    };
    serverObject = newCollection;
  }

  /**
   * Sets the @var serverObject to a new Manifest type serverObject
   * @returns void
   */
  function handleNewManifestPressed() {
    let newManifest: Manifest = {
      id: "",
      slug: "",
      label: {
        value: "",
      },
      type: "manifest",
      from: "canvases",
      canvases: [],
    };
    serverObject = newManifest;
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
