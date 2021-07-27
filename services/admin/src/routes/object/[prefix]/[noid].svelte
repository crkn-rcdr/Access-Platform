<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
-->
<script context="module" lang="ts">
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
      console.log("ERROR", e);
      return e;
    }
  };
</script>

<script lang="ts">
  import { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import Editor from "$lib/components/access-objects/Editor.svelte";
  import { page } from "$app/stores";

  export let object: AccessObject;
</script>

{#if object}
  <Editor bind:object />
{:else}
  Loading...
{/if}
