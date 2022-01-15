<!--
@component
### Overview
This component allows the user to find packages in the dipstaging database.

### Properties
|    |    |    |
| -- | -- | -- |
| results: ImportStatus[] | required | The packages to display |

### Usage
```
<DipstagingLookup bind:results />
```
*Note: `bind:` is required for changes to the properties to be reflected in higher level components.*
-->
<script lang="ts">
  import { getStores, page } from "$app/stores";
  import type { Session } from "$lib/types";
  import type { ImportStatus } from "@crkn-rcdr/access-data";
  import { onMount } from "svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import DipstagingLookupTable from "$lib/components/dipstaging/DipstagingLookupTable.svelte";

  /**
   * @type {ImportStatus[]}
   * The packages in the format of ImportStatus, to be displayed to the user/
   */
  export let results: ImportStatus[] | undefined;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type { string } The value of the text input where users can enter slugs
   */
  let slugListString: string = "";

  /**
   * @type { string } The array of slugs derived from @var slugListString
   */
  let slugList: string[] = [];

  /**
   * @type { boolean } If the lookup has completed or not.
   */
  let loading: boolean = false;

  /**
   * @type { string } Used to diaplay any errors from the backend to the user.
   */
  let error = "";

  /**
   * Sends the request to look up the items by slug to the backend and saves the results
   * @returns void
   */
  async function sendLookupRequestSlugs() {
    if (loading) return;
    loading = true;
    if (slugListString.includes(",")) slugList = slugListString.split(",");
    else slugList = slugListString.split("\n");
    slugList = slugList.filter((slug) => slug.trim().length);
    if (slugList.length) {
      slugList = slugList.map((slug) => slug.trim());
      try {
        const response = await $session.lapin.query(
          "dipstaging.listFromSlugs",
          slugList
        );
        if (response) results = response;
      } catch (e) {
        error =
          "Could not fetch package(s.) Please contact the platform team for assistance.";
      }
    }
    loading = false;
  }

  onMount(async () => {
    const slugListStrPrm = $page.query.get("slugs");
    if (slugListStrPrm) {
      slugListString = slugListStrPrm;
      await sendLookupRequestSlugs();
    }
  });
</script>

<div class="wrapper">
  <NotificationBar message={error} status="fail" />
  <br />
  {#if loading}
    Searching for {slugListString}...
  {:else}
    <div class="table-wrap">
      <DipstagingLookupTable isSlugSearch={true} bind:results />

      {#if !results}
        <div class="lookup-msg">
          <br />
          <i>Look-up results will appear here.</i>
        </div>
      {:else if results.length === 0}
        <br />
        No packages found.
      {/if}
    </div>
  {/if}
</div>
