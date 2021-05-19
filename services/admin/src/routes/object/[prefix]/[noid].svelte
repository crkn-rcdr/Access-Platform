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
      const object = json.object;
      let type = "other";
      // if (isCollection(object)) {
      //   type = "collection";
      // } else if (isCanvasManifest(object)) {
      //   type = "canvasManifest";
      // }
      return { props: { object, type } };
    } else {
      return { status: response.status, error: new Error(json.error) };
    }
  };
</script>

<script lang="ts">
  // import type {
  //   AccessObject,
  //   isCanvasManifest,
  //   isCollection,
  // } from "@crkn-rcdr/access-data";
  export let object: any;
  export let type: "collection" | "canvasManifest" | "other";
</script>

<h1>{object["id"]}</h1>

<h2>This is a {type}</h2>

<pre>{JSON.stringify(object, null, 2)}</pre>
