<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import StatusIndicator from "$lib/components/access-objects/StatusIndicator.svelte";
  import InfoEditor from "$lib/components/access-objects/InfoEditor.svelte";

  export let object: AccessObject;
  export let model: AccessObject;
</script>

<div class="editor full-bleed">
  <SideMenuContainer>
    <Toolbar slot="side-menu-header" title={object["slug"]}>
      <div
        class="end-content auto-align auto-align__j-end auto-align__a-end auto-align__column"
      >
        <StatusIndicator bind:object />
        <EditorActions bind:object bind:model />
      </div>
    </Toolbar>

    <SideMenuPageList>
      <SideMenuPageListButton>General Info</SideMenuPageListButton>
      <slot name="editor-menu" />
    </SideMenuPageList>
    <SideMenuBody>
      <SideMenuPage>
        <!-- Designed to be generic? -->
        <InfoEditor bind:model />
      </SideMenuPage>
      <slot name="editor-content" />
    </SideMenuBody>
  </SideMenuContainer>
</div>

<style>
  :global(.editor div[slot]) {
    width: 100%;
    height: 100%;
  }
</style>
