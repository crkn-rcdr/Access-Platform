<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { SideMenuPageData } from "$lib/types";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import ManifestEditor from "$lib/components/manifests/ManifestEditor.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import StatusIndicator from "$lib/components/access-objects/StatusIndicator.svelte";
  import InfoEditor from "$lib/components/access-objects/InfoEditor.svelte";

  export let object: AccessObject;

  let pageList: Array<SideMenuPageData> = [];
  let rfdc: any; // Deep copies an object
  let objectModel: AccessObject; // Used to keep track of changes to the object, without changing the actual object until save is pressed.

  async function setDataModel(object: AccessObject) {
    if (!object) return;

    rfdc = (await import("rfdc")).default();
    objectModel = rfdc(object) as AccessObject; // todo: get this done with zod

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
      ];
    }
  }

  $: {
    // Share any changes that occur in this component with the sub-components in the navigator.
    if (object) setDataModel(object);
  }
</script>

{#if object && objectModel}
  <div class="editor">
    <SideMenuContainer {pageList}>
      <Toolbar
        slot="side-menu-header"
        title={object?.["slug"]?.length
          ? object["slug"]
          : `Slugless ${object["type"]}`}
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

<style>
  :global(.editor .header) {
    min-height: 6em !important;
  }
</style>
