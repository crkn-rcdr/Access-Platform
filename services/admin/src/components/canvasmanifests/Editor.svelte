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
  import ContentEditor from "./ContentEditor.svelte";
  import InfoEditor from "./InfoEditor.svelte";
  import StatusIndicator from "./StatusIndicator.svelte";
  import EditorActions from "./EditorActions.svelte";

  export let object: AccessObject;
  export let model: CanvasManifest;
</script>

<Toolbar title={object["slug"]}>
  <Align direction="column" vertical="flex-end">
    <StatusIndicator bind:manifest={model} />
    <EditorActions bind:manifest={object} bind:manifestModel={model} />
  </Align>
</Toolbar>

<!--TODO: Wrap each types in an editor component -->
<SideMenuContainer>
  <SideMenuPageList>
    <SideMenuPageListButton>General Info</SideMenuPageListButton>
    <SideMenuPageListButton>Content</SideMenuPageListButton>
  </SideMenuPageList>
  <SideMenuBody>
    <SideMenuPage>
      <!--{JSON.stringify(object)}-->
      <InfoEditor bind:manifest={model} />
    </SideMenuPage>
    <SideMenuPage>
      <ContentEditor bind:manifest={model} />
    </SideMenuPage>
  </SideMenuBody>
</SideMenuContainer>
