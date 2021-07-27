<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |
-->
<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import type { Manifest, Collection } from "@crkn-rcdr/access-data";
  import Editor from "$lib/components/access-objects/Editor.svelte";

  let object: AccessObject;

  //TODO: call niod service to generate id in the backend
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
    object = newCollection;
  }

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
    object = newManifest;
  }
</script>

{#if object}
  <Editor bind:object />
{:else}
  <div class="wrapper">
    <div
      class="object-type-select auto-align auto-align__column auto-align__j-center  auto-align__a-center"
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
  .object-type-select {
    width: 100%;
  }
  .object-type-select > * {
    margin-bottom: 1rem;
  }
</style>
