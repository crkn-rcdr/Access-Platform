<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
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
  };
</script>

<script lang="ts">
  // TODO: figure out why putting import statements down here works. it happens by default when you use vscode to find your import
  import { isCanvasManifest, isCollection } from "@crkn-rcdr/access-data";
  // if we kept AccessObject in the import above, the code fails on the client. always use `import type` with types
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";

  import Switch from "../../../components/shared/Switch.svelte";
  import SwitchCase from "../../../components/shared/SwitchCase.svelte";
  import Editor from "../../../components/canvasmanifests/Editor.svelte";

  export let object: AccessObject;
  export let type: "collection" | "canvasManifest" | "other";
  type = "canvasManifest"; //TODO: implement type check

  let clone: any;
  let model: CanvasManifest; // | Canvas etc...

  async function setDataModel(object: AccessObject) {
    clone = (await import("rfdc")).default();
    model = clone(object);
  }

  $: setDataModel(object).then(() => {
    console.log("Done");
  });
</script>

<!--TODO: remove test code-->
{#if object && model}
  <Switch checkVal={type}>
    <SwitchCase caseVal="canvasManifest">
      <div class="editor">
        <Editor {object} {model} />
      </div>
    </SwitchCase>
  </Switch>
{/if}

<slot />

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
