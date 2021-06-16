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
  import { isCanvasManifest, isCollection } from "@crkn-rcdr/access-data";
  // if we kept AccessObject in the import above, the code fails on the client. always use `import type` with types
  import type { AccessObject } from "@crkn-rcdr/access-data";
  export let object: AccessObject;
</script>

{#if object}
  {JSON.stringify(object)}
{/if}
