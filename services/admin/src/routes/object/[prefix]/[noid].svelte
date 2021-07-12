<script lang="ts">
  import { getContext } from "svelte";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { SideMenuPageData } from "$lib/types";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import ManifestContentEditor from "$lib/components/manifests/ManifestContentEditor.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import StatusIndicator from "$lib/components/access-objects/StatusIndicator.svelte";
  import InfoEditor from "$lib/components/access-objects/InfoEditor.svelte";

  let object: AccessObject;
  const objectStore: SvelteStore<AccessObject> = getContext("objectStore");
  object = $objectStore;
  setDataModel(object);

  let pageList: Array<SideMenuPageData> = [];

  let rfdc: any; // Deep copies an object
  let objectModel: AccessObject; // Used to keep track of changes to the object, without changing the actual object until save is pressed.
  async function setDataModel(object: AccessObject) {
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
            contentComponent: ManifestContentEditor,
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
      ];
    }
  }
</script>

<slot />

{#if object && objectModel}
  <div class="editor">
    <SideMenuContainer {pageList}>
      <Toolbar slot="side-menu-header" title={object["slug"]}>
        <div
          class="end-content auto-align auto-align__j-end auto-align__a-end auto-align__column"
        >
          <StatusIndicator bind:object />
          <EditorActions bind:object bind:objectModel />
        </div>
      </Toolbar>
    </SideMenuContainer>
  </div>
{/if}

<style>
  :global(.editor .header) {
    min-height: 5em !important;
  }
</style>
