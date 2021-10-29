<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import JsonTree from "$lib/components/shared/JsonTree.svelte";
  import XmlViewer from "$lib/components/shared/XmlViewer.svelte";
  import Modal from "$lib/components/shared/Modal.svelte";
  import SideMenuContainer from "$lib/components/shared/SideMenuContainer.svelte";
  import SideMenuPageList from "$lib/components/shared/SideMenuPageList.svelte";
  import SideMenuPageListButton from "$lib/components/shared/SideMenuPageListButton.svelte";
  import SideMenuBody from "$lib/components/shared/SideMenuBody.svelte";
  import SideMenuPage from "$lib/components/shared/SideMenuPage.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

  /**
   *  @type { string } The 'id' of the DMDTask being shown.
   */
  export let dmdTaskId: string;

  /**
   *  @type { number | undefined } The index of the item being previewed, in the dmd tasks item array.
   */
  export let previewItemIndex: number | undefined = undefined;

  /**
   *  @type { boolean } A control for if the modal is open or not.
   */
  export let openPreviewModal: boolean = false;

  /**
   *  @type { string } The contents of the notification displayed for the preview, if any.
   */
  export let previewNotificationMsg: string = "";

  /**
   *  @type { string } A control for the styling of the notification displayed for the preview, if any.
   */
  export let previewNotificationStatus: "warn" | "fail" = "warn";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type { any } the json of the item that will show in the preview modal.
   */
  let itemPreviewMetadataJSON: any;

  /**
   * @type { string } The string file contents of the XML file generated for the item being previewed.
   */
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
      }
    } catch (e) {
      console.log(e?.message);
    }
  }

  /**
   * @listens previewItemIndex
   * @description Watches for changes to what item is being previewed through @var previewItemIndex, then calls @function getXml and @function getJson to set the contents of the modal.
   */
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
          <NotificationBar
            status={previewNotificationStatus}
            message={previewNotificationMsg}
          />
          <XmlViewer bind:xml={itemPreviewMetadataXML} />
        </SideMenuPage>
        <SideMenuPage>
          <NotificationBar
            status={previewNotificationStatus}
            message={previewNotificationMsg}
          />
          <JsonTree value={{ object: itemPreviewMetadataJSON }} />
        </SideMenuPage>
      </SideMenuBody>
    </SideMenuContainer>
  </div>
</Modal>
