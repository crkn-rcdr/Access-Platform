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

        let dates = ["", ""];
        const datesString = page.params["dates"];
        if (typeof datesString !== "undefined" && datesString !== "all") {
          dates = datesString.split(",");
          if (dates.length && dates[0].length) {
            bodyObj["from"] = dates[0];
            bodyObj["to"] = dates[1];
          }
        }

        const response: { count: number; results: LegacyPackage[] } =
          await context.lapin.query(`dipstaging.${route}`, bodyObj);
        console.log(response);

        if (response)
          return {
            props: {
              ...response,
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

  import Paginator from "$lib/components/shared/Paginator.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import { goto } from "$app/navigation";

  export let results: LegacyPackage[]; //: ImportStatus[]
  export let pageNumber: number;
  export let count: number;
  export let view: string = "";
  export let error: string = "";
  export let dates: string[];

  function refineByDate() {
    goto(
      `/smelter/${view}/${pageNumber}/${
        dates?.length && dates[0].length ? dates.toString() : "all"
      }`
    );
  }

  function handlePageChangePressed(event) {
    console.log(event);
    const route = `/smelter/${view}/${event.detail}/${
      dates?.length && dates[0].length ? dates.toString() : "all"
    }`;
    console.log(route);
    goto(route);
  }
</script>

<!--
{results}
{pageNumber}
{count}-->

<NotificationBar message={error} status="fail" />
{#if typeof results !== "undefined" && typeof pageNumber !== "undefined" && typeof count !== "undefined"}
  <DipstagingLegacyPackageTable bind:results bind:view bind:pageNumber>
    <span slot="dates" class="dates auto-align auto-align__a-end">
      <span class="auto-align auto-align__column">
        <label for="start">Start date:</label>
        <input type="date" id="start" name="trip-start" bind:value={dates[0]} />
      </span>
      <span class="auto-align auto-align__column">
        <label for="end">End date:</label>
        <input type="date" id="end" name="trip-end" bind:value={dates[1]} />
      </span>
      {#if dates[0]?.length && dates[1]?.length}
        <button class="secondary" on:click={refineByDate}
          >Refine Packages</button
        >
      {/if}
    </span>
  </DipstagingLegacyPackageTable>
  <Paginator
    page={pageNumber - 1}
    pageSize={10}
    {count}
    on:pageChange={handlePageChangePressed}
  />
{/if}

<style>
  .dates {
    flex: 9;
  }
  .dates > span:not(:first-child) {
    margin-left: var(--margin-sm);
  }
</style>
