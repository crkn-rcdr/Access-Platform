<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import ManifestContentEditor from "$lib/components/manifests/ManifestContentEditor.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import EditorLayout from "$lib/components/access-objects/EditorLayout.svelte";
  import { getContext } from "svelte";

  let object: AccessObject;
  const objectStore: SvelteStore<AccessObject> = getContext("objectStore");
  object = $objectStore;
  setDataModel(object);

  let type: "collection" | "canvasManifest" | "other";
  const typeStore: SvelteStore<"collection" | "canvasManifest" | "other"> =
    getContext("typeStore");
  type = $typeStore;

  let rfdc: any; // Deep copies an object
  let model: AccessObject;
  async function setDataModel(object: AccessObject) {
    rfdc = (await import("rfdc")).default();
    model = rfdc(object) as AccessObject;
  }
</script>

<slot />

{#if object && model}
  <!-- I couldn't have named slots in a regular __layout, not sure if there's a smarter way to make the layout more extensible-->
  <!-- I get an error if the check is in the EditorLayout about the slots-->
  {#if isManifest(model)}
    <EditorLayout bind:object bind:model>
      <span slot="editor-menu">
        <SideMenuPageListButton>Content</SideMenuPageListButton>
      </span>

      <span slot="editor-content">
        <SideMenuPage overflowY="hidden">
          <ManifestContentEditor bind:manifest={model} />
        </SideMenuPage>
      </span>
    </EditorLayout>
  {:else if isCollection(model)}
    <EditorLayout bind:object bind:model>
      <span slot="editor-menu">
        <!-- SideMenuPageListButton>Content</SideMenuPageListButton-->
      </span>

      <span slot="editor-content">
        <!--SideMenuPage overflowY="hidden">
        Collection Content! {JSON.stringify(object)}
      </SideMenuPage-->
      </span>
    </EditorLayout>
  {:else}
    <EditorLayout bind:object bind:model>
      <span slot="editor-menu">
        <!-- SideMenuPageListButton>Content</SideMenuPageListButton-->
      </span>

      <span slot="editor-content">
        <!--SideMenuPage overflowY="hidden">
        Other Content! {JSON.stringify(object)}
      </SideMenuPage-->
      </span>
    </EditorLayout>
  {/if}
{/if}
