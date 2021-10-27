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
        const pageNumber = parseInt(page.params["page"]) || 1;
        const pageSize = parseInt(page.params["size"]) || 10;
        let bodyObj = {
          page: pageNumber,
          pageSize: pageSize,
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

        const status = page.params["status"];
        if (typeof status !== "undefined") {
          bodyObj["status"] = status === "true";
        }

        const response: { count: number; results: LegacyPackage[] } =
          await context.lapin.query(`dipstaging.${route}`, bodyObj);

        if (response)
          return {
            props: {
              ...response,
              pageNumber,
              dates,
              view,
              pageSize,
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
  import Flatpickr from "svelte-flatpickr";
  import Paginator from "$lib/components/shared/Paginator.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import { goto } from "$app/navigation";

  export let results: LegacyPackage[]; //: ImportStatus[]
  export let pageNumber: number;
  export let pageSize: number;
  export let count: number;
  export let view: string = "";
  export let error: string = "";
  export let dates: string[];
  export let status: boolean;

  function getDateRouteStr() {
    return dates?.length && dates[0].length ? `/${dates.toString()}` : "";
  }

  function getStatusRouteStr() {
    return view === "status" && status !== null ? `/${status}` : "";
  }

  function filter() {
    const datesRouteStr = getDateRouteStr();
    const statusRouteStr = getStatusRouteStr();
    //${pageNumber}
    goto(`/smelter/${view}/1/${pageSize}${datesRouteStr}${statusRouteStr}`, {
      noscroll: true,
    });
  }

  function reset() {
    goto(`/smelter/${view}/1/${pageSize}/all`, { noscroll: true });
  }

  function handlePaginatorChange(event) {
    const datesRouteStr = getDateRouteStr();
    const statusRouteStr = getStatusRouteStr();
    const route = `/smelter/${view}/${event.detail.page}/${
      event.detail.pageSize
    }${datesRouteStr.length ? datesRouteStr + statusRouteStr : "/all"}`;
    goto(route, { noscroll: true });
  }

  function handleDateRangeSelected(event: { detail: any[] }) {
    console.log(event.detail);
    if (event.detail.length === 3) {
      dates = event.detail[1].split(" to ");
    }
  }
</script>

<NotificationBar message={error} status="fail" />
{#if typeof results !== "undefined" && typeof pageNumber !== "undefined" && typeof count !== "undefined"}
  <DipstagingLegacyPackageTable bind:results bind:view bind:pageNumber>
    <span slot="actions" class="dates auto-align auto-align__a-end">
      {#if view === "status"}
        <span class="status auto-align auto-align__a-center">
          <label for="status">Status:</label>
          <select name="status" bind:value={status}>
            <option disabled selected value>select an option</option>
            <option value={true}>Succeeded</option>
            <option value={false}>Failed</option>
          </select>
        </span>
      {/if}

      <div class="auto-align auto-align__a-center">
        <span class="flatpickr-date-filter-label">Filter by date range:</span>
        <Flatpickr
          value={dates?.[0]?.length ? `${dates[0]} to ${dates[1]}` : ""}
          options={{ mode: "range" }}
          on:change={handleDateRangeSelected}
          name="date"
        />
      </div>

      <button
        class="refine-button primary"
        on:click={filter}
        disabled={!(
          dates[0]?.length &&
          dates[1]?.length &&
          (view !== "status" || status !== null)
        )}
      >
        Filter
      </button>
      {#if dates[0]?.length && dates[1]?.length && (view !== "status" || status !== null)}
        <button
          class="refine-button secondary"
          on:click={reset}
          disabled={!(
            dates[0]?.length &&
            dates[1]?.length &&
            (view !== "status" || status !== null)
          )}
        >
          Clear Filters
        </button>
      {/if}
    </span>
  </DipstagingLegacyPackageTable>
  <Paginator
    page={pageNumber - 1}
    {pageSize}
    {count}
    on:change={handlePaginatorChange}
  />
{/if}

<style>
  .dates {
    flex: 9;
  }
  .dates > span:not(:first-child) {
    margin-left: var(--margin-sm);
  }
  .refine-button {
    margin-left: var(--margin-sm);
  }
  .status,
  .status label {
    margin-right: var(--margin-sm);
  }
  .status select {
    margin-top: 0;
    padding: 1.15rem var(--perfect-fourth-8);
  }
</style>
