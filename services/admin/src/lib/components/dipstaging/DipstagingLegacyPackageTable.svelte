<script lang="ts">
  import FaFilter from "svelte-icons/fa/FaFilter.svelte";
  import FaSort from "svelte-icons/fa/FaSort.svelte";
  import type { LegacyPackage } from "@crkn-rcdr/access-data";
  import PopupMenu from "../shared/PopupMenu.svelte";
  export let results: LegacyPackage[];

  export let view: "dip" | "neversmelted" | "queue" | "status" = "dip";
</script>

{#if results}
  <div>Group by: status, message, date, date & time</div>
  <div class="table-actions auto-align">
    <input class="search" placeholder="Search the table..." />
    <!--button class="primary clear-button">Clear</button-->
    <button class="primary">Run Smelter</button>
  </div>
  <br />
  <br />
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th class="center sm"><input type="checkbox" /></th>

          <th class="center sm">
            <div class="auto-align auto-align__a-center">
              <PopupMenu on:cancel={() => {}} on:ok={() => {}}>
                <span class="icon filter" slot="popup-button">
                  <FaFilter />
                </span>
                Content
                <span class="chip">value</span>
                <span class="chip">value</span>
                <span class="chip">value</span>
                <span class="chip">value</span>
              </PopupMenu>
              <span class="colname"> Id </span>
              <span class="icon sort">
                <FaSort />
              </span>
            </div>
          </th>
          <th class="center sm">
            <div class="auto-align auto-align__a-center">
              <span class="icon filter">
                <FaFilter />
              </span>
              <span class="colname"> Slug </span>
              <span class="icon sort">
                <FaSort />
              </span>
            </div>
          </th>
          <th class="center sm">
            <div class="auto-align auto-align__a-center">
              <span class="icon filter">
                <FaFilter />
              </span>
              <span class="colname"> Smelt Status </span>
              <span class="icon sort">
                <FaSort />
              </span>
            </div>
          </th>
          <th class="center sm">
            <div class="auto-align auto-align__a-center">
              <span class="icon filter">
                <FaFilter />
              </span>
              <span class="colname"> Message </span>
              <span class="icon sort">
                <FaSort />
              </span>
            </div>
          </th>
          <th class="center sm">
            <div class="auto-align auto-align__a-center">
              <span class="icon filter">
                <FaFilter />
              </span>
              <span class="colname"> Repos Manifest Date </span>
              <span class="icon sort">
                <FaSort />
              </span>
            </div>
          </th>
          <th class="center sm">
            <div class="auto-align auto-align__a-center">
              <span class="icon filter">
                <FaFilter />
              </span>
              <span class="colname"> Request Date </span>
              <span class="icon sort">
                <FaSort />
              </span>
            </div>
          </th>
          <th class="center sm">
            <div class="auto-align auto-align__a-center">
              <span class="icon filter">
                <FaFilter />
              </span>
              <span class="colname"> Process Date </span>
              <span class="icon sort">
                <FaSort />
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {#each results as legacyPackage}
          <tr>
            <td><input type="checkbox" /></td>
            <td>
              {legacyPackage.id}
            </td>
            <td>
              {legacyPackage.slug}
            </td>
            {#if legacyPackage.smelt}
              <td>
                {legacyPackage.smelt?.["succeeded"] ? "Suceeded" : "Failed"}
              </td>
            {:else}
              <td> N/A </td>
            {/if}

            <td>
              {legacyPackage.smelt?.["message"]?.length
                ? legacyPackage.smelt?.["message"]
                : "N/A"}
            </td>
            <td>
              {legacyPackage.reposManifestDate
                ? new Date(legacyPackage.reposManifestDate).toLocaleString()
                : "N/A"}
            </td>

            <td>
              {legacyPackage.smelt?.requestDate
                ? new Date(legacyPackage.smelt?.requestDate).toLocaleString()
                : "N/A"}
            </td>

            <td>
              {legacyPackage.smelt?.["processDate"]
                ? new Date(
                    legacyPackage.smelt?.["processDate"]
                  ).toLocaleString()
                : "N/A"}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .table-wrap {
    min-height: 20rem;
  }
  thead tr {
    width: 100%;
  }

  .icon,
  .icon svg {
    cursor: pointer;
  }
  .icon {
    color: var(--secondary);
  }
  .icon:hover {
    background: none !important;
  }

  .icon.sort {
    width: 1.3rem;
    height: 1.4rem;
    margin-top: -0.12rem;
  }
  .icon.filter {
    width: 1rem;
    height: 1.7rem;
  }
  .colname {
    flex: 9;
  }
  th div {
    width: 100%;
  }

  th:not(:first-child) {
    border-left: 1px solid var(--border-color);
  }

  .table-actions {
    width: 100%;
  }
  .clear-button {
    margin-right: var(--margin-sm);
  }
  input.search {
    flex: 9;
    margin-right: 1rem;
  }
</style>
