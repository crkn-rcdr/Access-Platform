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
      return { props: { object } };
    } else {
      return { status: response.status, error: new Error(json.error) };
    }
  };
</script>

<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isCanvasManifest, isCollection } from "@crkn-rcdr/access-data";
  import Align from "$lib/components/shared/Align.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import ManifestStatusIndicator from "$lib/components/manifests/ManifestStatusIndicator.svelte";
  import ManifestContentEditor from "$lib/components/manifests/ManifestContentEditor.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import AccessObjectInfoEditor from "$lib/components/access-objects/AccessObjectInfoEditor.svelte";
  import EditorLayout from "$lib/components/access-objects/EditorLayout.svelte";

  export let object: AccessObject;

  /*let type: string | undefined; //"collection" | "manifest" | "other";
  import { page } from "$app/stores";
  page.subscribe((page) => {
    ({ type } = page.params);
  });*/

  let rfdc: any; // Deep copies an object
  let model: AccessObject; // | Canvas etc...

  async function setDataModel(object: AccessObject) {
    rfdc = (await import("rfdc")).default();
    model = rfdc(object) as AccessObject;
  }

  $: setDataModel(object);
</script>

{#if object && model}
  <!-- I have to use the typecheck here otherwise we get a type error-->
  <!-- By having the if type here we only need to check once -->
  {#if isCanvasManifest(model)}
    <!-- I couldn't have named slots in a regular __layout, not sure if there's a smarter way to make the layout more extensible-->
    <EditorLayout bind:model>
      <Align slot="toolbar" direction="column" vertical="flex-end">
        <ManifestStatusIndicator bind:manifest={model} />
        <EditorActions {object} {model} />
      </Align>

      <div slot="editor-menu">
        <SideMenuPageListButton>General Info</SideMenuPageListButton>
        <SideMenuPageListButton>Content</SideMenuPageListButton>
      </div>

      <div slot="editor-content">
        <SideMenuPage>
          <AccessObjectInfoEditor bind:model />
        </SideMenuPage>
        <SideMenuPage overflowY="hidden">
          <ManifestContentEditor bind:manifest={model} />
        </SideMenuPage>
      </div>
    </EditorLayout>
  {:else if isCollection(model)}
    <EditorLayout bind:model>
      <Align slot="toolbar" direction="column" vertical="flex-end">
        <EditorActions {object} {model} />
        <!--collections can be published eh?-->
      </Align>

      <div slot="editor-menu">
        <SideMenuPageListButton>General Info</SideMenuPageListButton>
      </div>

      <div slot="editor-content">
        <SideMenuPage>
          <AccessObjectInfoEditor bind:model />
        </SideMenuPage>
      </div>
    </EditorLayout>
  {:else}
    Other! {JSON.stringify(object)}
  {/if}
{/if}
