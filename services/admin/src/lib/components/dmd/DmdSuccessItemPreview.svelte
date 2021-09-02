<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import JsonTree from "$lib/components/shared/JsonTree.svelte";
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";
  import Modal from "$lib/components/shared/Modal.svelte";
  import SideMenuContainer from "../shared/SideMenuContainer.svelte";
  import SideMenuPageList from "../shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "../shared/SideMenuPageListButton.svelte";
  import SideMenuBody from "../shared/SideMenuBody.svelte";
  import SideMenuPage from "../shared/SideMenuPage.svelte";
  import { onMount } from "svelte";

  /**
   *  @type { string } The 'id' of the DMDTask being shown.
   */
  export let dmdTaskId: string;
  export let previewItemIndex: number | undefined = undefined;
  export let openPreviewModal: boolean = false;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type { any } the json of the item that will show in the preview modal.
   */
  let itemPreviewMetadataJSON: any;

  let itemPreviewMetadataXML: string;

  /**
   * Handles showing the json preview modal for the item
   * @returns void
   */
  async function getJson() {
    try {
      if (previewItemIndex !== undefined) {
        itemPreviewMetadataJSON = await $session.lapin.mutation(
          `dmdTask.fetchResult`,
          {
            type: "json",
            index: previewItemIndex,
            task: dmdTaskId,
          }
        );
        console.log("itemPreviewMetadataJSON", itemPreviewMetadataJSON);
      }
    } catch (e) {
      console.log(e?.message);
    }
  }

  /**
   * Handles showing the json preview modal for the item
   * @returns void
   */
  async function getXml() {
    console.log(previewItemIndex);
    try {
      if (previewItemIndex !== undefined) {
        itemPreviewMetadataXML = <string>await $session.lapin.mutation(
          `dmdTask.fetchResult`,
          {
            type: "xml",
            index: previewItemIndex,
            task: dmdTaskId,
          }
        );
        console.log("itemPreviewMetadataXML", itemPreviewMetadataXML);
      }
    } catch (e) {
      console.log(e?.message);
    }
  }

  $: {
    previewItemIndex;
    getXml();
    getJson();
  }
</script>

<Modal bind:open={openPreviewModal} title={`Preview Metadata`} size="lg">
  <div slot="body" class="code-block">
    <SideMenuContainer fullPage={false}>
      <SideMenuPageList>
        <SideMenuPageListButton on:click={() => console.log("xml")}
          >XML</SideMenuPageListButton
        >
        <SideMenuPageListButton on:click={() => console.log("json")}
          >JSON</SideMenuPageListButton
        >
      </SideMenuPageList>
      <SideMenuBody>
        <SideMenuPage>
          <XmlViewer bind:xml={itemPreviewMetadataXML} />
        </SideMenuPage>
        <SideMenuPage>
          <JsonTree value={{ object: itemPreviewMetadataJSON }} />
        </SideMenuPage>
      </SideMenuBody>
    </SideMenuContainer>
  </div>
</Modal>
