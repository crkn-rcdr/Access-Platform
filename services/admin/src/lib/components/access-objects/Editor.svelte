<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*

**Example two**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
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

  /**
   * @type {AccessObject} Object being edited.
   */
  export let object: AccessObject;

  /**
   * @type {string} Slug being resolved.
   */
  let pageList: Array<SideMenuPageData> = [];

  /**
   * @type {string} Slug being resolved.
   */
  let rfdc: any; // Deep copies an object

  /**
   * @type {string} Slug being resolved.
   */
  let objectModel: AccessObject; // Used to keep track of changes to the object, without changing the actual object until save is pressed.

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
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

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
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
