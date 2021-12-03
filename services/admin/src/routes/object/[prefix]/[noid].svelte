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
        const response = await context.lapin.query("accessObject.getPaged", id);

        const serverObject =
          response.type === "collection"
            ? PagedCollection.parse(response)
            : PagedManifest.parse(response);

        const membership = await context.lapin.query(
          "accessObject.getMembership",
          id
        );

        let firstPage: ObjectListPage;
        let childrenCount;

        if (serverObject["members"]) {
          firstPage = await context.lapin.query("collection.pageAfter", {
            id: serverObject.id,
            after: null,
            limit: 100,
          });
          childrenCount = serverObject["members"].count;
        } else if (serverObject["canvases"]) {
          firstPage = await context.lapin.query("manifest.pageAfter", {
            id: serverObject.id,
            after: null,
            limit: 100,
          });
          childrenCount = serverObject["canvases"].count;
        }

        return {
          props: {
            serverObject,
            membership,
            id,
            childrenCount,
            firstPage,
            error: "",
          },
        };
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
  import {
    ObjectListPage,
    PagedCollection,
    PagedManifest,
  } from "@crkn-rcdr/access-data";
  import type { Membership, Noid } from "@crkn-rcdr/access-data";
  import Editor from "$lib/components/access-objects/Editor.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Loading from "$lib/components/shared/Loading.svelte";

  export let id: Noid;

  /**
   * @type {PagedCollection | PagedManifest} Object being edited.
   */
  export let serverObject: PagedCollection | PagedManifest;

  /**
   * Membership record for this object.
   */
  export let membership: Membership;

  /**
   * First page of members in the object.
   */
  export let firstPage: ObjectListPage;

  /**
   * The number of children in the object.
   */
  export let childrenCount: number;

  /**
   * @type {string} An error message insdicating what went wrong.
   */
  export let error: string;

  // The `key` directive below reloads this component's contents when `id` changes.
</script>

{#key id}
  {#if serverObject}
    <Editor bind:serverObject {membership} {firstPage} {childrenCount} />
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
{/key}
