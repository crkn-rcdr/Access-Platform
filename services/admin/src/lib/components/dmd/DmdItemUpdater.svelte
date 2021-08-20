<script lang="ts">
  import { getStores } from "$app/stores";
  import type { AccessPlatform, Session } from "$lib/types";

  /**
   * @type {"ready" | "updating" | "updated" | "error"} This vaiable keeps track of the state of the component, to show relevant messages to the user.
   */
  export let state: "ready" | "updating" | "updated" | "error" = "ready";

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  export let accessPlatform: AccessPlatform;

  /**
   *  @type { string } The 'id' of the DMDTask being processed.
   */
  export let dmdTaskId: string;

  /**
   *  @type { (
    | DmdLoadedParseRecord
    | DmdUpdatedParseRecord
  )[] } The dmdtask items to update (holds both results of the lookup and update.)
   */
  export let itemsLookupAndUpdateResults = [];

  /**
   * @type { boolean } If the request to update should be sent to the selected access platform
   */
  export let shouldUpdateInAccess: boolean = true;

  /**
   * @type { boolean } If the request to update should be sent to preservation
   */
  export let shouldUpdateInPreservation: boolean = true;

  /**
   * @type { number } The completion percentage of the updating process
   */
  export let updatedProgressPercentage = 0;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * TODO: Delete
   * Helper method to simulate backend processing time
   * */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Removes any previous update results from @var itemsLookupAndUpdateResults
   * @returns void
   */
  function clearResults() {
    for (let i = 0; i < itemsLookupAndUpdateResults.length; i++) {
      if ("updatedInAccess" in itemsLookupAndUpdateResults[i])
        delete itemsLookupAndUpdateResults[i]["updatedInAccess"];
      if ("updatedInPreservation" in itemsLookupAndUpdateResults[i])
        delete itemsLookupAndUpdateResults[i]["updatedInPreservation"];
    }
  }

  /**
   * Calls @function clearResults then sends a request using @var $session.lapin to update the items in @var itemsLookupAndUpdateResults metadata. It stores the new update results in @var itemsLookupAndUpdateResults. It sets the @var updatedProgressPercentage as each item's store request is sent. It also sets @var state as needed to show the user relevant information.
   * @returns void
   */
  async function handleUpdatePressed() {
    clearResults();

    if (itemsLookupAndUpdateResults.length > 0) {
      state = "updating";
      updatedProgressPercentage = 0;
      let index = 0;

      for (const item of itemsLookupAndUpdateResults) {
        if (item.foundInAccess) {
          const response = await $session.lapin.mutation(
            "dmdTask.storeAccess",
            {
              task: dmdTaskId,
              index,
              slug: item["slug"],
              noid: item["noid"],
            }
          );
          if (response) {
            itemsLookupAndUpdateResults[index] = {
              ...item,
              updatedInAccess: true,
              updatedInPreservation: false,
            };
          } else {
            itemsLookupAndUpdateResults[index] = {
              ...item,
              updatedInAccess: false,
              updatedInPreservation: false,
            };
          }
        } else {
          itemsLookupAndUpdateResults[index] = {
            ...item,
            updatedInAccess: false,
            updatedInPreservation: false,
          };
        }

        updatedProgressPercentage = Math.round(
          ((index + 1) / itemsLookupAndUpdateResults.length) * 100
        );

        itemsLookupAndUpdateResults = itemsLookupAndUpdateResults;
        index++;
        await sleep(1000);
      }
      state = "updated";
    }
  }
</script>

<div class="update-wrap auto-align auto-align__a-center auto-align__j-between ">
  <span>
    <input name="access" type="checkbox" bind:checked={shouldUpdateInAccess} />
    <label for="access">in {accessPlatform["label"]}</label>
  </span>
  <span>
    <input
      name="preservation"
      type="checkbox"
      bind:checked={shouldUpdateInPreservation}
    />
    <label for="preservation">in Preservation</label>
  </span>
  {#if shouldUpdateInAccess || shouldUpdateInPreservation}
    <button class="primary" on:click={handleUpdatePressed}>
      {state === "updated"
        ? "Update Descriptive Metadata Records Again"
        : "Update Descriptive Metadata Records"}
    </button>
  {/if}
</div>

<style>
  .update-wrap {
    width: 100%;
  }
</style>
