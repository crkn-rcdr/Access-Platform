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
      } else if (isManifest(object)) {
        type = "canvasManifest";
      }
      return { props: { object, type } };
    } else {
      return { status: response.status, error: new Error(json.error) };
    }
  };
</script>

<script lang="ts">
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import { writable } from "svelte/store";
  import { setContext } from "svelte";
  export let object: AccessObject;
  export let type: "collection" | "manifest" | "other";

  // Source: https://stackoverflow.com/questions/60911171/how-to-pass-data-from-a-layout-to-a-page-in-sapper
  // Do you know a better solution?
  const objectStore = writable(object);
  $: $objectStore = object;
  setContext("objectStore", objectStore);

  const typeStore = writable(type);
  $: $typeStore = type;
  setContext("typeStore", typeStore);
</script>

<slot />
