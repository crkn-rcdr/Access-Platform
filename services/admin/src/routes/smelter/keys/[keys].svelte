<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      const keys = decodeURIComponent(
        decodeURIComponent(page.params["keys"])
      ).split(",");
      console.log(keys);
      if (keys) {
        const response = await context.lapin.query(
          "dipstaging.listFromKeys",
          keys
        );
        if (response) return { props: { results: response, keys } };
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
  import DipstagingItemStatusTable from "$lib/components/dipstaging/DipstagingItemStatusTable.svelte";
  export let keys: string[];
  export let results: ImportStatus[];
  export let error: string = "";
</script>

{error}
<DipstagingItemStatusTable bind:results />
<!--https://access-dev.canadiana.ca/smelter/keys/test
  Dipstaging {keys} /-->
