<script context="module" lang="ts">
  /**
   * @module
   * @description loads in the dmdtask from the backend using the params in the route of the page
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      if (page?.params?.["keys"]&& page?.params?.["access"]) {
        const response = await context.lapin.query(
          "dipstagingListFromKeys",
          page.params["keys"]
        );
        if (response && "result" in response)
          return { props: { dipstaging: response.result } };
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
      return { props: { error: e } };
    }
  };
</script>
<script lang="ts">
/**
 * @file
 * @description This page displays the information about the dipstaging process
*/
import { Dipstaging} from "$lib/components/dipstaging/Dipstaging.svelte";
export let views: 

</script>