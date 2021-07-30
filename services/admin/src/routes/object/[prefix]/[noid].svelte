<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the object from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      if (page.params["prefix"] && page.params["noid"]) {
        const id = [
          page.params["prefix"] as string,
          page.params["noid"] as string,
        ].join("/");
        const response = await context.lapin.query("noid.resolve", id);
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
      return e;
    }
  };
</script>

<script lang="ts">
  /**
   * @file
   * @description This page shows the editor for the object.
   * The object is given to the page from the module above.
   */
  import { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import Editor from "$lib/components/access-objects/Editor.svelte";

  /**
   * @type {AccessObject} Object being edited.
   */
  export let object: AccessObject;
</script>

{#if object}
  <Editor bind:object />
{:else}
  Loading...
{/if}
