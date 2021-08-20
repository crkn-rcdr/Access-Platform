<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";

  export let shouldUpdateInPreservation: boolean = true;
  export let shouldUpdateInAccess: boolean = true;
  export let state: "ready" | "updating" | "updated" | "error" = "ready";
  export let itemsResults = [];

  export let dmdTaskId: string;
  export let accessPlatform: {
    prefix: string;
    label: string;
  };

  export let updatedProgressPercentage = 0;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function handleUpdatePressed() {
    for (let i = 0; i < itemsResults.length; i++) {
      if ("updatedInAccess" in itemsResults[i])
        delete itemsResults[i]["updatedInAccess"];
      if ("updatedInPreservation" in itemsResults[i])
        delete itemsResults[i]["updatedInPreservation"];
    }

    if (itemsResults.length > 0) {
      state = "updating";
      updatedProgressPercentage = 0;
      let index = 0;
      for (const item of itemsResults) {
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
            itemsResults[index] = {
              ...item,
              updatedInAccess: true,
              updatedInPreservation: false,
            };
          } else {
            itemsResults[index] = {
              ...item,
              updatedInAccess: false,
              updatedInPreservation: false,
            };
          }
        } else {
          itemsResults[index] = {
            ...item,
            updatedInAccess: false,
            updatedInPreservation: false,
          };
        }

        updatedProgressPercentage = Math.round(
          ((index + 1) / itemsResults.length) * 100
        );

        itemsResults = itemsResults;
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
