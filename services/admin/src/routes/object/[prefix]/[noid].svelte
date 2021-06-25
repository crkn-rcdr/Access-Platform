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

  let pageList: Array<SideMenuPageData> | undefined;

  let rfdc: any; // Deep copies an object
  let model: AccessObject;
  async function setDataModel(object: AccessObject) {
    rfdc = (await import("rfdc")).default();
    model = rfdc(object) as AccessObject;

    if (isManifest(model)) {
      pageList = [
        {
          name: "General Info",
          componentData: {
            component: InfoEditor,
            props: { model },
            update: () => {
              model = model;
            },
          },
        },
        {
          name: "Content",
          componentData: {
            component: ManifestContentEditor,
            props: { manifest: model },
            update: () => {
              model = model;
            },
          },
        },
      ];
    } else if (isCollection(model)) {
      pageList = [
        {
          name: "General Info",
          componentData: {
            component: InfoEditor,
            props: { model },
            update: () => {
              model = model;
            },
          },
        },
      ];
    }
  }
</script>

<slot />

{#if object && model}
  <SideMenuContainer {pageList}>
    <Toolbar slot="side-menu-header" title={object["slug"]}>
      <div
        class="end-content auto-align auto-align__j-end auto-align__a-end auto-align__column"
      >
        <StatusIndicator bind:object />
        <EditorActions bind:object bind:model />
      </div>
    </Toolbar>
  </SideMenuContainer>
{/if}
