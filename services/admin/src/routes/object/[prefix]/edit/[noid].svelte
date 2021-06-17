<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isCanvasManifest, isCollection } from "@crkn-rcdr/access-data";
  import ManifestContentEditor from "$lib/components/manifests/ManifestContentEditor.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import EditorLayout from "$lib/components/access-objects/EditorLayout.svelte";
  import { getContext } from "svelte";

  let object: AccessObject;
  const objectStore: SvelteStore<AccessObject> = getContext("objectStore");
  $: object = $objectStore;
  $: setDataModel(object);

  let type: "collection" | "canvasManifest" | "other";
  const typeStore: SvelteStore<"collection" | "canvasManifest" | "other"> =
    getContext("typeStore");
  $: type = $typeStore;
  $: console.log(type);

  let rfdc: any; // Deep copies an object
  let model: AccessObject;
  async function setDataModel(object: AccessObject) {
    rfdc = (await import("rfdc")).default();
    model = rfdc(object) as AccessObject;
    console.log(model);
  }
</script>

<slot />

{#if object && model}
  <!-- I couldn't have named slots in a regular __layout, not sure if there's a smarter way to make the layout more extensible-->
  <EditorLayout bind:object bind:model>
    <div slot="editor-menu">
      <!-- Not sure if this is any more performant than the isManifest check -->
      {#if type === "canvasManifest"}
        <SideMenuPageListButton>Content</SideMenuPageListButton>
      {:else if type === "collection"}
        <!-- Extra menus for collection-->
      {:else}
        <!--Extra menus for other-->
      {/if}
    </div>

    <div slot="editor-content">
      <SideMenuPage overflowY="hidden">
        <!-- I have to use the typecheck here otherwise we get a type error-->
        {#if isCanvasManifest(model)}
          <ManifestContentEditor bind:manifest={model} />
        {:else if isCollection(model)}
          Collection! {JSON.stringify(object)}
        {:else}
          Other! {JSON.stringify(object)}
        {/if}
      </SideMenuPage>
    </div>
  </EditorLayout>
{/if}
