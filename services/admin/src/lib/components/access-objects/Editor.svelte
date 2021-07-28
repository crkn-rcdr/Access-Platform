<!--
@component
### Overview
The editor component allows for the editing of AccessObjects. It will dynamically render the appropriate screens and options based on the AccessObject sub-type (collection, manifest...)

### Properties
|    |    |    |
| -- | -- | -- |
| object : AccessObject  | required | An object of type AccessObject that will be editable in the editor. |

### Usage
```  
<Editor bind:object />
```
*Note: `bind:` is required for changes to the object to be reflected in higher level components.*
-->
<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import type { SideMenuPageData } from "$lib/types";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import ManifestContentEditor from "$lib/components/manifests/ManifestContentEditor.svelte";
  import CollectionContentEditor from "$lib/components/collections/CollectionContentEditor.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import StatusIndicator from "$lib/components/access-objects/StatusIndicator.svelte";
  import InfoEditor from "$lib/components/access-objects/InfoEditor.svelte";

  /**
   * @type {AccessObject} Object being edited.
   */
  export let object: AccessObject;

  /**
   * @type {Array<SideMenuPageData>} This list controls the pages that appear in the side menu container, and their contents.
   */
  let pageList: Array<SideMenuPageData> = [];

  /**
   * @type {any} A module that deep copies an object
   */
  let rfdc: any;

  /**
   * @type {AccessObject} An object of type AccessObject. This is a copy of the source object being edited. The model is used to keep track of changes to the object, without changing the actual object until save is pressed.
   */
  let objectModel: AccessObject;

  /**
   * Sets the sidemenu container component's pages and menu items based off of the model of the object to be edited's type.
   * @param object
   * @returns void
   */
  async function setPageList() {
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
        {
          name: "Content",
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

  /**
   * Deep copies the object to be edited into the objectModel variable.
   * @param object
   * @returns void
   */
  async function setDataModel(object: AccessObject) {
    if (!object) return;

    rfdc = (await import("rfdc")).default();
    objectModel = rfdc(object) as AccessObject; // todo: get this done with zod
  }

  /**
   * @listens object
   * @description A reactive code block that is executed any time the object to be edited changes. It calls @function setDataModel and @function setPageList, to share any changes that occur in this component with the sub-components in the navigator.
   */
  $: {
    if (object) {
      setDataModel(object);
      setPageList();
    }
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
