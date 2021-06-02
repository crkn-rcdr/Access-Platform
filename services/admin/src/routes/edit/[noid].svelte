<script lang="ts">
  import "../../app.css"; // TODO: Is this the best way to implement global styling?
  import { cloneDeep } from "lodash";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../../components/shared/Align.svelte";
  import Toolbar from "../../components/shared/Toolbar.svelte";
  import SideMenuContainer from "../../components/shared/SideMenuContainer.svelte";
  import ContentEditor from "../../components/canvasmanifests/ContentEditor.svelte";
  import InfoEditor from "../../components/canvasmanifests/InfoEditor.svelte";
  import SideMenuBody from "../../components/shared/SideMenuBody.svelte";
  import SideMenuPageListButton from "../../components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "../../components/shared/SideMenuPage.svelte";
  import SideMenuPageList from "../../components/shared/SideMenuPageList.svelte";
  import StatusIndicator from "../../components/canvasmanifests/StatusIndicator.svelte";
  import EditorActions from "../../components/canvasmanifests/EditorActions.svelte";
  //import { page } from "$app/stores";
  //const { noid } = $page.params;

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
        id: "69429%2Fc0b56d40px5r",
        label: {
          value:
            "Ut mattis congue elit, a posuere est facilisis vitae. Duis consectetur sit amet augue eu rhoncus. Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
      {
        id: "69429%2Fc06d5pb3254z",
        label: {
          value:
            "Est facilisis vitae. Duis consectetur sit amet augue eu rhoncus. Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
      {
        id: "69429%2Fc02n4zj5dd10",
        label: {
          value:
            "Duis consectetur sit amet augue eu rhoncus. Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
      {
        id: "69429%2Fc0xw47r7s308",
        label: {
          value:
            "Aenean euismod, mi a blandit ullamcorper, ipsum nisi pharetra tellus, eget placerat libero dolor in nibh. Nulla eget imperdiet sem. Pellentesque pellentesque elit eu elit commodo hendrerit.",
        },
      },
      {
        id: "69429%2Fc0t43j004981",
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

  let testModel: CanvasManifest = cloneDeep(test);
</script>

<svelte:head>
  <title>Editor</title>
</svelte:head>

<div class="editor">
  <Toolbar title={test["slug"]}>
    <Align direction="column" vertical="flex-end">
      <!--TODO: check object type & add if-->
      <StatusIndicator bind:manifest={testModel} />
      <!--TODO: check object type & add if-->
      <EditorActions bind:manifest={test} bind:manifestModel={testModel} />
    </Align>
  </Toolbar>

  <SideMenuContainer>
    <SideMenuPageList>
      <SideMenuPageListButton>General Info</SideMenuPageListButton>
      <SideMenuPageListButton>Content</SideMenuPageListButton>
    </SideMenuPageList>

    <SideMenuBody>
      <SideMenuPage>
        <!--TODO: check object type & add if-->
        <InfoEditor bind:manifest={testModel} />
      </SideMenuPage>
      <SideMenuPage>
        <!--TODO: check object type & add if-->
        <ContentEditor bind:manifest={testModel} />
      </SideMenuPage>
    </SideMenuBody>
  </SideMenuContainer>
</div>

<style>
  .editor {
    height: 900px;
    width: 1483px;
    margin-bottom: 200px;
  }
</style>
