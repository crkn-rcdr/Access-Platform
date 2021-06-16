<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  export const load: Load = async ({ page, fetch }) => {
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
      } else if (isCanvasManifest(object)) {
        type = "canvasManifest";
      }
      return { props: { object, type } };
    } else {
      return { status: response.status, error: new Error(json.error) };
    }
  };
</script>

<script lang="ts">
  // TODO: figure out why putting import statements down here works. it happens by default when you use vscode to find your import
  import { isCanvasManifest, isCollection } from "@crkn-rcdr/access-data";
  // if we kept AccessObject in the import above, the code fails on the client. always use `import type` with types
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import Align from "$lib/components/shared/Align.svelte";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import AccessObjectInfoEditor from "$lib/components/access-objects/AccessObjectInfoEditor.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import ManifestStatusIndicator from "$lib/components/manifests/ManifestStatusIndicator.svelte";
  import ManifestContentEditor from "$lib/components/manifests/ManifestContentEditor.svelte";

  export let object: AccessObject;
  export let type: "collection" | "canvasManifest" | "other";

  let rfdc: any; // Deep copies an object
  let model: AccessObject; // | Canvas etc...

  async function setDataModel(object: AccessObject) {
    rfdc = (await import("rfdc")).default();
    model = rfdc(object) as AccessObject;
  }

  $: setDataModel(object);
</script>

{#if object && model && type}
  <div class="editor">
    <Toolbar title={model["slug"]}>
      <Align direction="column" vertical="flex-end">
        {#if isCanvasManifest(model)}
          <ManifestStatusIndicator bind:manifest={model} />
        {/if}
        <EditorActions {object} {model} />
      </Align>
    </Toolbar>

    <SideMenuContainer>
      <SideMenuPageList>
        <SideMenuPageListButton>General Info</SideMenuPageListButton>
        <SideMenuPageListButton>Content</SideMenuPageListButton>
      </SideMenuPageList>
      <SideMenuBody>
        <SideMenuPage>
          <AccessObjectInfoEditor bind:model />
        </SideMenuPage>
        <SideMenuPage overflowY="hidden">
          {#if isCanvasManifest(model)}
            <ManifestContentEditor bind:manifest={model} />
          {:else if isCollection(model)}
            {JSON.stringify(object)}
          {:else}
            Other! {JSON.stringify(object)}
          {/if}
        </SideMenuPage>
      </SideMenuBody>
    </SideMenuContainer>
  </div>
{/if}

<slot />

<style>
  .editor {
    position: fixed;
    top: 74px; /* todo: not perfect on big screens */
    bottom: 115px;
    right: 0;
    left: 0;
  }
</style>
