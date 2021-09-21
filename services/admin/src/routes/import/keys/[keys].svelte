<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      const keys = decodeURIComponent(page.params["keys"]).split(",");
      if (keys) {
        const response = await context.lapin.query(
          "dipstaging.listFromKeys",
          keys
        );
        if (response) return { props: { dipstaging: response, keys } };
        else
          return {
            props: {
              error: {
                message: "No Views found",
              },
            },
          };
      }
      return { props: {} };
    } catch (e) {
      return { props: { error: e?.message } };
    }
  };
</script>

<script lang="ts">
  /**
   * @file
   * @description This page displays the information about the dipstaging process
   */
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import Dipstaging from "$lib/components/dipstaging/Dipstaging.svelte";
  export let keys: string[];
  export let dipstaging: ImportStatus[];
  export let error: string = "";
</script>

{error}
{keys}
{#if dipstaging}
  {JSON.stringify(dipstaging)}
{/if}

<!--https://access-dev.canadiana.ca/import/keys/test
  Dipstaging {keys} /-->
