<script context="module" lang="ts">
  /**
   * @module
   * @description
   */
  import type { Load } from "@sveltejs/kit";
  import type { RootLoadOutput } from "$lib/types";
  import type { LegacyPackage } from "@crkn-rcdr/access-data";
  import DipstagingLegacyPackageTable from "$lib/components/dipstaging/DipstagingLegacyPackageTable.svelte";
  export const load: Load<RootLoadOutput> = async ({ page, context }) => {
    try {
      //: ImportStatus[]
      const response: LegacyPackage[] = await context.lapin.query(
        "dipstaging.listSmeltQueue"
      );
      if (response) return { props: { results: response } };
      else
        return {
          props: {
            error: {
              message: "No Views found",
            },
          },
        };
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
  //import type { ImportStatus } from "@crkn-rcdr/access-data";
  //import DipstagingTable from "$lib/components/dipstaging/DipstagingTable.svelte";

  export let results: LegacyPackage[]; //: ImportStatus[]
  export let error: string = "";
</script>

{error}
<DipstagingLegacyPackageTable bind:results />
