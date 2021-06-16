<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import Toolbar from "$lib/components/shared/Toolbar.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";

  export let model: AccessObject;
</script>

<div class="editor">
  <Toolbar title={model["slug"]}>
    <slot name="toolbar" />
  </Toolbar>
  <SideMenuContainer>
    <SideMenuPageList>
      <slot name="editor-menu" />
    </SideMenuPageList>
    <SideMenuBody>
      <slot name="editor-content" />
    </SideMenuBody>
  </SideMenuContainer>
</div>

<style>
  .editor {
    position: fixed;
    top: 74px; /* todo: not perfect on big screens */
    bottom: 115px;
    right: 0;
    left: 0;
  }
  :global(.editor div[slot]) {
    width: 100%;
    height: 100%;
  }
</style>
