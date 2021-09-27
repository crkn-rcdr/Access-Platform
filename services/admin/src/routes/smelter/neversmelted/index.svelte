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
      const pageNumber = parseInt(page.query.get("page")) || 1;
      const response: LegacyPackage[] = await context.lapin.query(
        "dipstaging.listNeverSmelted",
        {
          page: pageNumber,
          pageSize: 10,
        }
      );
      if (response)
        return {
          props: {
            results: response,
            pageNumber,
          },
        };
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
  export let pageNumber: number;
  export let error: string = "";
</script>

{error}
{pageNumber}
{#if typeof results !== "undefined" && typeof pageNumber !== "undefined"}
  <DipstagingLegacyPackageTable
    bind:results
    view="neversmelted"
    bind:pageNumber
  />
{/if}
