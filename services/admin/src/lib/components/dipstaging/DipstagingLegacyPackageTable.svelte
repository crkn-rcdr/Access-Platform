<script lang="ts">
  import type { LegacyPackage } from "@crkn-rcdr/access-data";

  export let results: LegacyPackage[];

  export let view: "dip" | "neversmelted" | "queue" | "status" = "dip";
</script>

<!--
  {
  "_id": "success",
  "_rev": "80-4bc295f01a043397ce34c490154c2161",
  "repos": ["toma", "swift", "romano", "eclipse"],
  "reposManifestDate": "2016-03-08T21:45:41Z",
  "reposDate": "2020-06-02T15:20:19Z",
  "updated": "2020-06-02T15:20:19Z",
  "METS": [
    {
      "md5": "0b488a2ed74b77eee5854c3ac942cdf9",
      "path": "data/revisions/20160308T212400.partial/metadata.xml"
    },
    {
      "md5": "3874ae6f0e72c7798ac63d2070d65826",
      "path": "data/sip/data/metadata.xml"
    }
  ],
  "METSManifestDate": "2016-03-08T21:45:41Z",
  "METSDate": "2019-08-29T19:45:37Z",
  "slug": "success",
  "smelt": {
    "succeeded": true,
    "message": "test",
    "requestDate": "2020-04-20T20:28:52Z",
    "processDate": "2020-04-22T21:01:24Z"
  }
}

-->
{#if results}
  <table>
    <thead>
      <tr>
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
            {legacyPackage.slug}
          </td>

          {#if view !== "neversmelted" && view !== "dip"}
            <td>
              {legacyPackage.reposManifestDate}
            </td>

            <td>
              {legacyPackage.smelt?.requestDate}
            </td>

            <td>
              {legacyPackage.smelt?.["processDate"]}
            </td>

            {#if view !== "queue"}
              <td>
                {legacyPackage.smelt?.["succeeded"]}
              </td>
            {/if}

            <td>
              {legacyPackage.smelt?.["message"]}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}
