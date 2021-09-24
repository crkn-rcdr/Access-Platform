<script lang="ts">
  import type { LegacyPackage } from "@crkn-rcdr/access-data";

  export let results: LegacyPackage[];

  export let view: "dip" | "neversmelted" | "queue" | "status" = "dip";
</script>

{#if results}
  <table>
    <thead>
      <tr>
        <th>Id</th>
        <th>Slug</th>
        {#if view !== "neversmelted" && view !== "dip"}
          <th>Repos Manifest Date</th>
          <th>Request Date</th>
          <th>Process Date</th>
          {#if view !== "queue"}
            <th>Status</th>
          {/if}
          <th>Message</th>
        {/if}
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

          {#if view !== "neversmelted" && view !== "dip"}
            <td>
              {legacyPackage.reposManifestDate
                ? legacyPackage.reposManifestDate
                : "N/A"}
            </td>

            <td>
              {legacyPackage.smelt?.requestDate
                ? legacyPackage.smelt?.requestDate
                : "N/A"}
            </td>

            <td>
              {legacyPackage.smelt?.["processDate"]
                ? legacyPackage.smelt?.["processDate"]
                : "N/A"}
            </td>

            {#if view !== "queue"}
              <td>
                {legacyPackage.smelt?.["succeeded"] ? "Suceeded" : "Failed"}
              </td>
            {/if}

            <td>
              {legacyPackage.smelt?.["message"]?.length
                ? legacyPackage.smelt?.["message"]
                : "N/A"}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
