<script lang="ts">
  // TODO: Is this the best way to implement global styling?
  import "../../app.css";

  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";

  import { page } from "$app/stores";

  import Align from "../../components/shared/Align.svelte";
  import Toolbar from "../../components/shared/Toolbar.svelte";
  import SideMenuContainer from "../../components/shared/SideMenuContainer.svelte";
  import ContentEditor from "../../components/canvasmanifests/ContentEditor.svelte";
  import InfoEditor from "../../components/shared/InfoEditor.svelte";
  import SideMenuBody from "../../components/shared/SideMenuBody.svelte";
  import SideMenuPageListButton from "../../components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "../../components/shared/SideMenuPage.svelte";
  import SideMenuPageList from "../../components/shared/SideMenuPageList.svelte";

  const { noid } = $page.params;

  let test: CanvasManifest = {
    id: "123428",
    _rev: "123",
    public: 1622213541,
    updated: 1622213541,
    updateInternalmeta: {
      requestDate: 1622213541,
    },
    slug: "oocihm.8_06842_6",
    label: {
      value: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    summary: {
      value:
        "Vivamus sit amet suscipit risus. Mauris commodo felis ut tortor luctus, id lobortis nibh lobortis.",
    },
    dmdType: "marc",
    type: "manifest",
    behavior: "paged",
    viewingDirection: "left-to-right",
    from: "canvases",
    canvases: [
      {
        id: "111",
        label: {
          value:
            "Ut mattis congue elit, a posuere est facilisis vitae. Duis consectetur sit amet augue eu rhoncus. Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
      {
        id: "112",
        label: {
          value:
            "Est facilisis vitae. Duis consectetur sit amet augue eu rhoncus. Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
      {
        id: "113",
        label: {
          value:
            "Duis consectetur sit amet augue eu rhoncus. Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
      {
        id: "114",
        label: {
          value:
            "Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
      {
        id: "115",
        label: {
          value:
            "Ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
    ],
    ocrPdf: {
      path: "/a/path",
      extension: "pdf",
      size: 123,
    },
  };
</script>

<svelte:head>
  <title>Editor</title>
</svelte:head>

<div class="editor">
  <Toolbar title="oocihm.8_06842_6">
    <Align direction="column">
      <span class="status">
        <label>Status: </label>
        <span>unpublished</span>
      </span>
      <span>
        <button class="save">Save</button>
        <button class="secondary">Publish</button>
      </span>
    </Align>
  </Toolbar>

  <SideMenuContainer>
    <SideMenuPageList>
      <SideMenuPageListButton>General Info</SideMenuPageListButton>
      <SideMenuPageListButton>Content</SideMenuPageListButton>
    </SideMenuPageList>

    <SideMenuBody>
      <SideMenuPage>
        <InfoEditor bind:manifest={test} />
      </SideMenuPage>
      <SideMenuPage>
        <ContentEditor bind:manifest={test} />
      </SideMenuPage>
    </SideMenuBody>
  </SideMenuContainer>
</div>

<style>
  .editor {
    height: 734px;
    width: 1483px;
  }
  .status {
    margin-bottom: 4px;
    color: var(--grey);
  }
  .status label,
  .status span {
    font-size: 16px !important;
  }
</style>
