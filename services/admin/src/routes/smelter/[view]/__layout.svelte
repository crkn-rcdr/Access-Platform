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
      let route:
        | "listNeverSmelted"
        | "listNewDip"
        | "listSmeltQueue"
        | "listSmeltStatus";
      const view = page.params["view"];
      if (view === "neversmelted") {
        route = "listNeverSmelted";
      } else if (view === "updated") {
        route = "listNewDip";
      } else if (view === "queue") {
        route = "listSmeltQueue";
      } else if (view === "status") {
        route = "listSmeltStatus";
      }

      if (route) {
        const pageNumber =
          parseInt(page.params["page"]) ||
          1; /*parseInt(page.query.get("page")) || 1;*/
        let bodyObj = {
          page: pageNumber,
          pageSize: 10,
        };
        const dates = page.params["dates"]
          ? page.params["dates"].split(",")
          : ["", ""];
        if (page.params["dates"]) {
          bodyObj["from"] = dates[0];
          bodyObj["to"] = dates[1];
        }

        const response: LegacyPackage[] = await context.lapin.query(
          `dipstaging.${route}`,
          bodyObj
        );
        console.log(response);

        if (response)
          return {
            props: {
              results: response,
              pageNumber,
              dates,
              view,
            },
          };
      }

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
  export let view: string = "";
  export let error: string = "";
  export let dates: string[];
</script>

{error}
{#if typeof results !== "undefined" && typeof pageNumber !== "undefined"}
  <DipstagingLegacyPackageTable
    bind:results
    bind:view
    bind:pageNumber
    bind:startDateStr={dates[0]}
    bind:endDateStr={dates[1]}
  />
{/if}
