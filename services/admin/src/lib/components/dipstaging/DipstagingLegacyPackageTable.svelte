<script lang="ts">
  import FaFilter from "svelte-icons/fa/FaFilter.svelte";
  import FaSort from "svelte-icons/fa/FaSort.svelte";
  import type { LegacyPackage } from "@crkn-rcdr/access-data";
  import PopupMenu from "../shared/PopupMenu.svelte";
  export let results: LegacyPackage[];
  export let pageNumber: number = 1;
  export let view: "dip" | "neversmelted" | "queue" | "status" = "dip";
</script>

{pageNumber}
{#if typeof results !== "undefined" && typeof pageNumber !== "undefined"}
  <div class="table-actions auto-align">
    <div>
      Group items in table by:
      <select>
        <option>status</option>
        <option>message</option>
        <option>date</option>
        <option>date & time</option>
      </select>
    </div>
    <div class="icon-input auto-align auto-align__a-center">
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
      <input class="search" placeholder="Search the table..." />
    </div>
    <!--div>
      restrict search to:
      <select>
        <option>status</option>
        <option>message</option>
        <option>date</option>
        <option>date & time</option>
      </select>
    </div-->
    <button class="primary">Run Smelter</button>
    <!--button class="primary clear-button">Clear</button-->
  </div>
  <br />
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
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
          <th class="center sm"><input type="checkbox" /></th>
        </tr>
      </thead>
      <tbody>
        {#each results as legacyPackage}
          <tr>
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
            <td><input type="checkbox" /></td>
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
  .icon-input {
    flex: 6;
    border: 1px solid var(--border-color);
    margin-top: 0.25rem;
    outline: none;
    border-radius: var(--border-radius);
    background-color: var(--form-field-bg);
    color: var(--base-font-color);
  }
  .icon-input input {
    flex: 9;
    border: none;
  }
</style>
