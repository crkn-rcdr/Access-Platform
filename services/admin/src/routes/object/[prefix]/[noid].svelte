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
        const response = await context.lapin.query("accessObject.get", id);
        const serverObject = AccessObject.parse(response);
        return { props: { serverObject } };
      }
      return { props: { error: "Could not find prefix or noid in url." } };
    } catch (e) {
      return { props: { error: e?.message } };
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
  import Editor from "$lib/components/access-objects/Editor.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  /**
   * @type {AccessObject} Object being edited.
   */
  export let serverObject: AccessObject;

  /**
   * @type {string} An error message insdicating what went wrong.
   */
  export let error: string;
</script>

{#if serverObject}
  <Editor bind:serverObject />
{:else if error}
  <br />
  <div class="wrapper">
    <NotificationBar status="fail" message={error} />
  </div>
{:else}
  <div class="wrapper center">
    <Loading backgroundType="gradient" /><br />
    Loading...
  </div>
{/if}
