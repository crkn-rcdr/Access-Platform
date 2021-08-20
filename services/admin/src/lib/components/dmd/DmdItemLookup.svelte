<!--
@component
### Overview
This components takes the items in a successfull dmd task and looks them up in a selected access platform and in preservation. it adds the lookup results to itemsLookupAndUpdateResults.

### Properties
|    |    |    |
| -- | -- | -- |
| accessPlatform: AccessPlatform | required | The access platform to look for the items in. |
| state: "ready" or "loading" or "loaded" or "error" | optional | This variable keeps track of the state of the component, to show relevant messages to the user. |
| itemsToLookup: ParseRecord[] | optional | The items to search for. |
| itemsLookupAndUpdateResults: (DmdLoadedParseRecord or DmdUpdatedParseRecord)[] | optional | The dmdtask items lookup and update results. Indexing exactly matches the itemsToLookup. |

### Usage
```
<DmdItemLookup
  bind:state={lookupState}
  bind:accessPlatform
  bind:itemsLookupAndUpdateResults
  itemsToLookup={dmdTask.items}
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import { getStores } from "$app/stores";
  import type {
    AccessPlatform,
    DmdLoadedParseRecord,
    DmdUpdatedParseRecord,
    Session,
  } from "$lib/types";
  import type { ParseRecord } from "@crkn-rcdr/access-data/dist/esm/dmd/Task";
  import DmdAccessPlatformSelector from "$lib/components/dmd/DmdAccessPlatformSelector.svelte";
  import LoadingButton from "$lib/components/shared/LoadingButton.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  export let accessPlatform: AccessPlatform;

  /**
   * @type {"ready" | "loading" | "loaded" | "error"} This variable keeps track of the state of the component, to show relevant messages to the user.
   */
  export let state: "ready" | "loading" | "loaded" | "error" = "ready";

  /**
   *  @type { ParseRecord[]  } The items to search for.
   */
  export let itemsToLookup: ParseRecord[] = [];

  /**
   *  @type { (
    | DmdLoadedParseRecord
    | DmdUpdatedParseRecord
  )[] } The dmdtask items lookup and update results. Indexing exactly matches the @var itemsToLookup
   */
  export let itemsLookupAndUpdateResults: (
    | DmdLoadedParseRecord
    | DmdUpdatedParseRecord
  )[] = [];

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   *  @type { string } Used to show the user relevant information when the load errors.
   */
  let errorMsg: string;

  /**
   * TODO: Delete
   * Helper method to simulate backend processing time
   * */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calls @var $session.lapin and looks for the @var itemsToLookup in the @var accessPlatform and in preservation. It then saves the results of the lookup into @var itemsLookupAndUpdateResults, to be displayed and manipulated by parent components. If errors occure, @errorMsg is set to alert the user.
   * @returns void
   */
  async function handleLookupPressed() {
    state = "loading";

    const response = await $session.lapin.query(
      "slug.resolveMany",
      itemsToLookup.map((item) => `${accessPlatform.prefix}.${item.id}`)
    );

    if (response) {
      itemsLookupAndUpdateResults = Object.keys(response).map((id) => {
        return <DmdLoadedParseRecord>{
          slug: id,
          noid: response[id]["result"]?.id,
          foundInAccess: response[id].found,
          foundInPreservation: false, // TODO: Ask how to implement this
        };
      });

      const lookupFailure =
        itemsLookupAndUpdateResults.filter(
          (item) => item.foundInAccess || item.foundInPreservation
        ).length === 0;

      if (!lookupFailure) {
        await sleep(5000);
        state = "loaded";
      } else {
        state = "error";
        errorMsg = `No items were found in ${accessPlatform["label"]} or in Preservation. Please select another access platform, or <a href="/dmd/new">process a new metadata file</a> to try again.`;
      }
    } else {
      state = "error";
      errorMsg = "Couldn't look-up items.";
    }
  }
</script>

<div
  class="look-up-wrap auto-align auto-align__a-center auto-align__j-between "
>
  <div class="select-wrap">
    <DmdAccessPlatformSelector bind:depositor={accessPlatform} />
  </div>

  {#if accessPlatform?.prefix?.length}
    <LoadingButton
      buttonClass={`${state === "ready" ? "primary" : "secondary"}`}
      showLoader={state === "loading"}
      on:clicked={handleLookupPressed}
    >
      <span slot="content">
        {state !== "loading"
          ? state === "loaded"
            ? "Look-up Again"
            : "Look-up"
          : "Looking-up..."}
      </span>
    </LoadingButton>
  {/if}
</div>

{#if state === "error"}
  <br />
  <br />
  <NotificationBar message={errorMsg} status="fail" />
{/if}

<style>
  .look-up-wrap {
    width: 100%;
  }
  .select-wrap {
    flex: 8;
    margin-right: 1rem;
  }
</style>
