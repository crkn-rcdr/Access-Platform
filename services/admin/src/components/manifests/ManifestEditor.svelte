<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../shared/Align.svelte";
  import Toolbar from "../shared/Toolbar.svelte";
  import SideMenuContainer from "../shared/SideMenuContainer.svelte";
  import SideMenuBody from "../shared/SideMenuBody.svelte";
  import SideMenuPageListButton from "../shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "../shared/SideMenuPage.svelte";
  import SideMenuPageList from "../shared/SideMenuPageList.svelte";
  import ManifestContentEditor from "./ManifestContentEditor.svelte";
  import ManifestInfoEditor from "./ManifestInfoEditor.svelte";
  import StatusIndicator from "./ManifestStatusIndicator.svelte";
  import ManifestEditorActions from "./ManifestEditorActions.svelte";

  export let object: AccessObject;
  export let model: CanvasManifest;

  // Test url: http://localhost:3060/object/69429/m02n4zg6h671
</script>

<Toolbar title={object["slug"]}>
  <Align direction="column" vertical="flex-end">
    <StatusIndicator bind:manifest={model} />
    <ManifestEditorActions bind:manifest={object} bind:manifestModel={model} />
  </Align>
</Toolbar>

<SideMenuContainer>
  <SideMenuPageList>
    <SideMenuPageListButton>General Info</SideMenuPageListButton>
    <SideMenuPageListButton>Content</SideMenuPageListButton>
  </SideMenuPageList>
  <SideMenuBody>
    <SideMenuPage>
      <ManifestInfoEditor bind:manifest={model} />
    </SideMenuPage>
    <SideMenuPage overflowY="hidden">
      <ManifestContentEditor bind:manifest={model} />
    </SideMenuPage>
  </SideMenuBody>
</SideMenuContainer>
