<script context="module" lang="ts">
  /*import type { Load } from "@sveltejs/kit";
  export const load: Load = async ({ page, fetch }) => {
    const id = [
      page.params["prefix"] as string,
      page.params["noid"] as string,
    ].join("/");
    const response = await fetch(`/object/${id}.json`);
    const json = await response.json();

    if (response.ok) {
      const object = json.object as AccessObject;
      let type = "other";
      if (isCollection(object)) {
        type = "collection";
      } else if (isCanvasManifest(object)) {
        type = "canvasManifest";
      }
      return { props: { object, type } };
    } else {
      return { status: response.status, error: new Error(json.error) };
    }
  };*/
</script>

<script lang="ts">
  import { onMount } from "svelte";

  // TODO: figure out why putting import statements down here works. it happens by default when you use vscode to find your import
  import { isCanvasManifest, isCollection } from "@crkn-rcdr/access-data";
  // if we kept AccessObject in the import above, the code fails on the client. always use `import type` with types
  import type { AccessObject } from "@crkn-rcdr/access-data";

  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import Align from "../../../components/shared/Align.svelte";
  import Toolbar from "../../../components/shared/Toolbar.svelte";
  import SideMenuContainer from "../../../components/shared/SideMenuContainer.svelte";
  import ContentEditor from "../../../components/canvasmanifests/ContentEditor.svelte";
  import InfoEditor from "../../../components/canvasmanifests/InfoEditor.svelte";
  import SideMenuBody from "../../../components/shared/SideMenuBody.svelte";
  import SideMenuPageListButton from "../../../components/shared/SideMenuPageListButton.svelte";
  import SideMenuPage from "../../../components/shared/SideMenuPage.svelte";
  import SideMenuPageList from "../../../components/shared/SideMenuPageList.svelte";
  import StatusIndicator from "../../../components/canvasmanifests/StatusIndicator.svelte";
  import EditorActions from "../../../components/canvasmanifests/EditorActions.svelte";
  import Switch from "../../../components/shared/Switch.svelte";
  import SwitchCase from "../../../components/shared/SwitchCase.svelte";

  export let object: AccessObject;
  export let type: "collection" | "canvasManifest" | "other";

  //TODO: grab real data
  type = "canvasManifest";

  let clone: any;

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

  let testModel: CanvasManifest;

  function setDataModel() {
    //TODO: get object from the backend
    testModel = clone(test);
  }

  onMount(async () => {
    clone = (await import("rfdc")).default();
    setDataModel();
  });
</script>

<!--TODO: remove test code-->
{#if test && testModel}
  <div class="editor">
    <Toolbar title={test["slug"]}>
      <Align direction="column" vertical="flex-end">
        <StatusIndicator bind:manifest={testModel} />
        <EditorActions bind:manifest={test} bind:manifestModel={testModel} />
      </Align>
    </Toolbar>

    <SideMenuContainer>
      <SideMenuPageList>
        <Switch bind:checkVal={type}>
          <SwitchCase caseVal="canvasManifest">
            <SideMenuPageListButton>General Info</SideMenuPageListButton>
            <SideMenuPageListButton>Content</SideMenuPageListButton>
          </SwitchCase>
        </Switch>
      </SideMenuPageList>

      <SideMenuBody>
        <Switch bind:checkVal={type}>
          <SwitchCase caseVal="canvasManifest">
            <SideMenuPage>
              {#if object}
                <h1>{object["id"]}</h1>

                <h2>This is a {type}</h2>

                <pre>{JSON.stringify(object, null, 2)}</pre>
              {/if}
              <InfoEditor bind:manifest={testModel} />
            </SideMenuPage>
            <SideMenuPage>
              <ContentEditor bind:manifest={testModel} />
            </SideMenuPage>
          </SwitchCase>
        </Switch>
      </SideMenuBody>
    </SideMenuContainer>
  </div>
{/if}

<style>
  .editor {
    /*height: 800px;
    width: 100%;*/

    /* Gets rid of the page scrolling */
    position: fixed;
    top: 74px;
    bottom: 115px;
    right: 0;
    left: 0;
  }

  html {
    overflow-y: hidden;
  }
</style>
