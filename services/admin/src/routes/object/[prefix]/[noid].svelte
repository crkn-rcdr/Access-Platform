<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import ManifestContentEditor from "$lib/components/manifests/ManifestContentEditor.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import StatusIndicator from "$lib/components/access-objects/StatusIndicator.svelte";
  import InfoEditor from "$lib/components/access-objects/InfoEditor.svelte";
  import { getContext } from "svelte";

  let object: AccessObject;
  const objectStore: SvelteStore<AccessObject> = getContext("objectStore");
  object = $objectStore;
  setDataModel(object);

  let pageList:
    | Array<{ name: string; componentData: { component: any; props: any } }> //ex: props {page1Prop: 1}
    | undefined;

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
          },
        },
        {
          name: "Content",
          componentData: {
            component: ManifestContentEditor,
            props: { manifest: model },
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
          },
        },
      ];
    }
  }
</script>

<slot />

{#if object && model}
  <div class="editor full-bleed">
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
  </div>
{/if}

<style>
  :global(.editor div[slot]) {
    width: 100%;
    height: 100%;
  }
</style>
