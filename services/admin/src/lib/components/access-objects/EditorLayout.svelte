<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import Align from "$lib/components/shared/Align.svelte";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import EditorActions from "$lib/components/access-objects/EditorActions.svelte";
  import StatusIndicator from "$lib/components/access-objects/StatusIndicator.svelte";
  import AccessObjectInfoEditor from "$lib/components/access-objects/AccessObjectInfoEditor.svelte";

  export let object: AccessObject;
  export let model: AccessObject;
</script>

<div class="editor">
  <Toolbar title={object["slug"]}>
    <Align direction="column" vertical="flex-end">
      <StatusIndicator bind:object />
      <EditorActions {object} {model} />
    </Align>
  </Toolbar>
  <SideMenuContainer>
    <SideMenuPageList>
      <SideMenuPageListButton>General Info</SideMenuPageListButton>
      <slot name="editor-menu" />
    </SideMenuPageList>
    <SideMenuBody>
      <SideMenuPage>
        <!-- Designed to be generic? -->
        <AccessObjectInfoEditor bind:model />
      </SideMenuPage>
      <slot name="editor-content" />
    </SideMenuBody>
  </SideMenuContainer>
</div>

<style>
  .editor {
    position: fixed;
    top: calc(
      4.5rem + var(--viewport-scaling)
    ); /* todo: not perfect on big screens */
    bottom: 7rem;
    right: 0;
    left: 0;
  }
  :global(.editor div[slot]) {
    width: 100%;
    height: 100%;
  }
</style>
