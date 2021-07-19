<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  export const load: Load = async ({ page, fetch }) => {
    if (page.params["prefix"] && page.params["noid"]) {
      const id = [
        page.params["prefix"] as string,
        page.params["noid"] as string,
      ].join("/");
      const response = await fetch(`/object/${id}.json`);
      const json = await response.json();

      if (response.ok) {
        const object = json.object as AccessObject;
        let type = "other";
        if (isCollection(object)) {
          type = "collection";
        } else if (isManifest(object)) {
          type = "canvasManifest";
        }
        return { props: { object, createMode: false } };
      } else {
        return {
          status: response.status,
          error: new Error(json.error),
          props: { createMode: false },
        };
      }
    } else return { props: { createMode: true } };
  };
</script>

<script lang="ts">
  import type {
    AccessObject,
    Manifest,
    Collection,
  } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { SideMenuPageData } from "$lib/types";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import ManifestEditor from "$lib/components/manifests/ManifestEditor.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import StatusIndicator from "$lib/components/access-objects/StatusIndicator.svelte";
  import InfoEditor from "$lib/components/access-objects/InfoEditor.svelte";
  // import CollectionEditor from "$lib/components/collection/CollectionEditor.svelte";
  import CollectionContentEditor from "$lib/components/collection/CollectionContentEditor.svelte";

  export let object: AccessObject;
  export let createMode: boolean;

  let pageList: Array<SideMenuPageData> = [];

  let rfdc: any; // Deep copies an object
  let objectModel: AccessObject; // Used to keep track of changes to the object, without changing the actual object until save is pressed.

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
      from: "",
      canvases: [],
    };
    object = newManifest;
  }

  async function setDataModel(object: AccessObject) {
    if (!object) return;
    rfdc = (await import("rfdc")).default();
    objectModel = rfdc(object) as AccessObject;

    if (isManifest(objectModel)) {
      pageList = [
        {
          name: "General Info",
          componentData: {
            contentComponent: InfoEditor,
            contentComponentProps: { object: objectModel },
            sideMenuPageProps: {},
            update: () => {
              objectModel = objectModel;
            },
          },
        },
        {
          name: "Content",
          componentData: {
            contentComponent: ManifestEditor,
            contentComponentProps: { manifest: objectModel },
            sideMenuPageProps: {
              overflowY: "hidden",
            },
            update: () => {
              objectModel = objectModel;
            },
          },
        },
      ];
    } else if (isCollection(objectModel)) {
      pageList = [
        {
          name: "General Info",
          componentData: {
            contentComponent: InfoEditor,
            contentComponentProps: { object: objectModel },
            sideMenuPageProps: {},
            update: () => {
              objectModel = objectModel;
            },
          },
        },
        {
          name: "Members",
          componentData: {
            contentComponent: CollectionContentEditor,
            contentComponentProps: { collection: objectModel },
            sideMenuPageProps: {
              overflowY: "hidden",
            },
            update: () => {
              objectModel = objectModel;
            },
          },
        },
      ];
    }
  }

  $: {
    // Share any changes that occur in this component with the sub-components in the navigator.
    setDataModel(object);
  }
</script>

<slot />

{#if object}
  {#if objectModel}
    <div class="editor">
      <SideMenuContainer {pageList}>
        <Toolbar
          slot="side-menu-header"
          title={createMode && object?.["slug"]?.length === 0
            ? `New ${object["type"]}`
            : object["slug"]}
        >
          <div
            class="end-content auto-align auto-align__full auto-align auto-align__j-end auto-align auto-align__a-end auto-align auto-align__column"
          >
            <StatusIndicator bind:object />
            <EditorActions bind:object bind:objectModel />
          </div>
        </Toolbar>
      </SideMenuContainer>
    </div>
  {/if}
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
  :global(.editor .header) {
    min-height: 6em !important;
  }

  .object-type-select {
    width: 100%;
  }
  .object-type-select > * {
    margin-bottom: 1rem;
  }
</style>
