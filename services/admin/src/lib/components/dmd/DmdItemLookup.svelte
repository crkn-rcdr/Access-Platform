<script lang="ts">
  import { getStores } from "$app/stores";
  import type { Session } from "$lib/types";

  import DmdDepositorSelector from "$lib/components/dmd/DmdDepositorSelector.svelte";
  import LoadingButton from "../shared/LoadingButton.svelte";
  import NotificationBar from "../shared/NotificationBar.svelte";

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  export let state: "ready" | "loading" | "loaded" | "error" = "ready";
  export let accessPlatform: {
    prefix: string;
    label: string;
  };
  export let itemsToLookup = [];
  export let itemsResults = [];

  let errorMsg: string;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function handleLookupPressed() {
    state = "loading";
    const response = await $session.lapin.query(
      "slug.resolveMany",
      itemsToLookup.map((item) => `${accessPlatform.prefix}.${item.id}`)
    );
    if (response) {
      itemsResults = Object.keys(response).map((id) => {
        let res = {
          slug: id,
          foundInAccess: response[id].found,
          foundInPreservation: false, // TODO: Ask how to implement this
        };

        if (response[id]["result"]) {
          res["noid"] = response[id]["result"].id;
        }
        return res;
      });

      let lookupFailure = itemsResults.filter((item) => item.found).length;

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
    <DmdDepositorSelector bind:depositor={accessPlatform} />
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
