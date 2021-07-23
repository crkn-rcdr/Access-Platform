<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import { getLapin } from "$lib/lapin";
  import type { RootInput } from "../../__layout.svelte";
  export const load: Load<RootInput> = async ({ page, context, session }) => {
    try {
      if (page.params["prefix"] && page.params["noid"]) {
        const id = [
          page.params["prefix"] as string,
          page.params["noid"] as string,
        ].join("/");
        const lapin = getLapin({ url: session.apiEndpoint, fetch: null });
        const response = await lapin.query("noid.resolve", id);
        const object = AccessObject.parse(response);
        let type = "other";
        if (isCollection(object)) {
          type = "collection";
        } else if (isManifest(object)) {
          type = "canvasManifest";
        }
        return { props: { object, createMode: false } };
      } else return { props: { createMode: true } };
    } catch (e) {
      console.log("ERROR", e);
      return e;
    }
  };
</script>

<script lang="ts">
  import { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import Editor from "$lib/components/access-objects/Editor.svelte";

  export let object: AccessObject;
</script>

{#if object}
  <Editor bind:object />
{:else}
  Loading...
{/if}
