<!--
@component
### Overview
The editor component allows for the editing of AccessObjects. It will dynamically render the appropriate screens and options based on the AccessObject sub-type (collection, manifest...)

### Properties
|    |    |    |
| -- | -- | -- |
| serverObject : AccessObject  | required | An serverObject of type AccessObject that will be editable in the editor. |

### Usage
```  
<Editor bind:serverObject />
```
*Note: `bind:` is required for changes to the serverObject to be reflected in higher level components.*
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
  import InfoEditor from "$lib/components/access-objects/EditorForm.svelte";
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";
  import { showConfirmation } from "$lib/utils/confirmation";
  import { editorObjectStore } from "$lib/stores/accessObjectEditorStore";
  import { onDestroy } from "svelte";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {AccessObject} Object being edited.
   */
  export let serverObject: AccessObject;

  /**
   * @type {"create" | "edit"} An indicator variable if the editor is in create mode or edit mode.
   */
  let mode: "create" | "edit";

  /**
   * @type {Array<SideMenuPageData>} This list controls the pages that appear in the side menu container, and their contents.
   */
  let pageList: Array<SideMenuPageData> = [];

  /**
   * @type {any} A module that deep copies an serverObject
   */
  let rfdc: any;

  async function saveChange(event: any) {
    return await showConfirmation(
      async () => {
        try {
          if (
            serverObject.type === "manifest" ||
            serverObject.type === "collection"
          ) {
            const bodyObj = {
              id: serverObject.id,
              user: $session.user,
              data: event.detail,
            };
            const response = await $session.lapin.mutation(
              `${serverObject.type}.edit`,
              bodyObj
            );
            await pullServerObject();
            return {
              success: true,
              details: JSON.stringify(bodyObj),
            };
          } else
            return {
              success: false,
              details: "Object not of type canvas or manifest",
            };
        } catch (e) {
          return {
            success: false,
            details: e.message,
          };
        }
      },
      "Success! Changes saved.",
      "Error: failed to save changes."
    );
  }

  /**
   * Sets the sidemenu container component's pages and menu items based off of the model of the serverObject to be edited's type.
   * @param serverObject
   * @returns void
   */
  async function setPageList() {
    if (!serverObject || !$editorObjectStore) return;
    if (isManifest(serverObject)) {
      pageList = [
        {
          name: "General Info",
          componentData: {
            contentComponent: InfoEditor,
            contentComponentProps: {
              mode,
              editorObject: $editorObjectStore,
            },
            sideMenuPageProps: {},
            listeners: {
              save: (event) => {
                saveChange(event);
              },
              change: (event) => {
                // Unfortunately just passing the store only works for members and canvases lists
                $editorObjectStore = event.detail;
              },
            },
          },
        },
        {
          name: "Manage Content",
          componentData: {
            contentComponent: ManifestContentEditor,
            contentComponentProps: { manifest: $editorObjectStore },
            sideMenuPageProps: {
              overflowY: "hidden",
            },
            listeners: {},
          },
        },
      ];
    } else if (isCollection($editorObjectStore)) {
      pageList = [
        {
          name: "General Info",
          componentData: {
            contentComponent: InfoEditor,
            contentComponentProps: {
              mode,
              editorObject: $editorObjectStore,
            },
            sideMenuPageProps: {},
            listeners: {
              save: (event) => {
                saveChange(event);
              },
              change: (event) => {
                // Unfortunately just passing the store only works for members and canvases lists
                $editorObjectStore = event.detail;
              },
            },
          },
        },
        {
          name: "Manage Members",
          componentData: {
            contentComponent: CollectionContentEditor,
            contentComponentProps: { collection: $editorObjectStore },
            sideMenuPageProps: {
              overflowY: "hidden",
            },
            listeners: {},
          },
        },
      ];
    }
  }

  /**
   * This method pulls the 'serverObject' from the backend. This resets the form and ensures that any problems saving changes are caught.
   * @returns void
   */
  async function pullServerObject() {
    try {
      const response = await $session.lapin.query(
        "accessObject.get",
        serverObject["id"]
      );
      serverObject = response;
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Deep copies the serverObject to be edited into the $editorObjectStore variable.
   * @param serverObject
   * @returns void
   */
  async function setDataModel(serverObject: AccessObject) {
    if (!serverObject) return;
    rfdc = (await import("rfdc")).default();
    editorObjectStore.set(rfdc(serverObject) as AccessObject); // todo: get this done with zod
    setPageList();
  }

  /**
   * @listens serverObject
   * @description A reactive code block that is executed any time the serverObject to be edited changes. It calls @function setDataModel and @function setPageList, to share any changes that occur in this component with the sub-components in the navigator.
   */
  $: {
    if (serverObject) {
      setDataModel(serverObject);
    }
  }

  $: {
    mode = serverObject?.id ? "edit" : "create";
  }

  onDestroy(() => {
    editorObjectStore.set(null);
  });
</script>

{#if serverObject && $editorObjectStore}
  <div class="editor">
    <SideMenuContainer bind:pageList>
      <Toolbar
        slot="side-menu-header"
        title={serverObject?.["slug"]?.length
          ? serverObject["slug"]
          : `Slugless ${serverObject["type"]}`}
      >
        <div
          class="end-content auto-align auto-align__full auto-align auto-align__j-end auto-align auto-align__a-end auto-align auto-align__column"
        >
          <StatusIndicator bind:serverObject />
          <EditorActions
            bind:serverObject
            bind:editorObject={$editorObjectStore}
            {mode}
            on:updated={pullServerObject}
          />
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
