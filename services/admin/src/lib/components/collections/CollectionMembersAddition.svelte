<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import { createEventDispatcher } from "svelte";
  import type { PagedCollection } from "@crkn-rcdr/access-data/src/access/Collection";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";

  import NotificationBar from "../shared/NotificationBar.svelte";
  import PrefixSlugSearchbox from "../access-objects/PrefixSlugSearchbox.svelte";
  import LoadingButton from "../shared/LoadingButton.svelte";

  /**
   * @type {PagedCollection} The Collection where the members are added to.
   */
  export let destinationMember: PagedCollection;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} If a Collection is selected.
   */
  let addingMembers = false;

  /**
   * @type {boolean} If the add button should be displayed over the list of members.
   */
  export let showAddButton = true;

  /**
   * @type { string } The label for the by-slug toggle
   */
  const LOOKUP_MEMBER_BUTTON_TEXT = "Add a member";

  /**
   * @type { boolean } If the lookup has completed run once yet.
   */
  let lookupDone: boolean = false;
  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * When a collection is selected from the table of search results, grab its details from the backend.
   * @param event
   * @returns void
   */
  function showAddClicked() {
    showAddButton = false;
    addingMembers = true;
    resolutions = null;
    dispatch("addClicked");
  }

  let id: string = destinationMember.id;
  let slugArray: string[] = [];
  let error: string;
  let searching: boolean = false;

  // https://github.com/sindresorhus/type-fest/blob/main/source/promise-value.d.ts
  type PromiseValue<PromiseType> = PromiseType extends PromiseLike<infer Value>
    ? PromiseValue<Value>
    : PromiseType;
  let resolutions: PromiseValue<ReturnType<typeof resolveMembers>>;

  async function resolveMembers() {
    console.log(slugArray);
    if (!slugArray.length) return;

    lookupDone = false;
    searching = true;
    error = "";

    if (id) {
      try {
        const response = await $session.lapin.query(
          "collection.checkAdditions",
          {
            id,
            slugArray,
          }
        );
        //[{"id":null,"result":{"type":"data","data":{"bl.test2":{"type":"manifest","id":"69429/g0z60bv7b71j","resolved":true}}}}]

        resolutions = response;
        for (let slug in resolutions) {
          if (resolutions[slug]["id"])
            selectedResults.push(resolutions[slug]["id"]);
        }
        selectedResults = selectedResults;
        lookupDone = true;
        searching = false;

        // I'm returning here so that we can type `resolutions` properly (see above)
        return response;
      } catch (e) {
        error =
          "Could not search and check for membership. Please contact the platform team for assistance.";
      }
    } else {
      try {
        const response = await $session.lapin.query(
          "slug.lookupMany",
          slugArray
        );

        resolutions = Object.fromEntries(
          response.map(([slug, r]): [string, any] => {
            if (r.found) {
              selectedResults.push(r.result.id);
              selectedResults = selectedResults;
              return [
                slug,
                {
                  resolved: true,
                  ...r.result,
                },
              ];
            }
            return [slug, { error: "not-found", resolved: false }];
          })
        );
        lookupDone = true;
        searching = false;

        // I'm returning here so that we can type `resolutions` properly (see above)
        return response;
      } catch (e) {
        error =
          "Could not search. Please contact the platform team for assistance.";
      }
    }
  }

  function handleCancelPressed() {
    addingMembers = false;
    showAddButton = true;
    slugArray = [];
    dispatch("done");
  }

  /**
   * When add is pressed, add the selected members to the begining of the destination collection's members list, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */
  let selectedResults: string[] = [];
  function checkIfAllItemsSelected(event) {
    if (!event.target.checked) {
      const index = selectedResults.indexOf(event.target.value);
      if (index > -1) {
        selectedResults.splice(index, 1);
      }
    } else {
      selectedResults.push(event.target.value);
    }
    selectedResults = selectedResults;
  }

  async function handleAddPressed() {
    console.log("adding", selectedResults);
    dispatch("done", {
      selectedMembers: selectedResults,
    });
    destinationMember = destinationMember;

    addingMembers = false;
    showAddButton = true;
    selectedResults = [];
    slugArray = [];
    resolutions = {};
  }
</script>

<div class="member-selector-wrap add-menu">
  <div
    class="move-button auto-align auto-align__full auto-align auto-align__column"
  >
    {#if showAddButton}
      <button class="primary lg" on:click={showAddClicked}>
        {LOOKUP_MEMBER_BUTTON_TEXT}
      </button>
    {/if}
    {#if addingMembers}
      <div class="exit-button">
        <button
          class="secondary cancel-button auto-align auto-align__a-center"
          on:click={handleCancelPressed}
        >
          <div class="icon">
            <TiArrowBack />
          </div>
          Exit
        </button>
      </div>
    {/if}
  </div>
  {#if addingMembers}
    <div class="search-wrap">
      <br />
      <p>
        Please search for items to add to your collection, then select them if
        found.
      </p>
      <div>
        <!--PrefixSelector bind:depositor />
        <textarea
          rows="4"
          placeholder="Enter a list of slugs seperated by commas or new lines."
          bind:value={input}
        /><br /-->
        <PrefixSlugSearchbox
          on:slugs={(event) => {
            console.log("slugs:", event.detail);
            slugArray = event.detail;
          }}
        />
        <LoadingButton
          buttonClass={lookupDone ? "secondary" : "primary"}
          disabled={slugArray.length === 0}
          showLoader={searching}
          on:clicked={resolveMembers}
        >
          <span slot="content">{searching ? "Searching..." : "Search"}</span>
        </LoadingButton>
      </div>
      <br />
      <NotificationBar status="fail" message={error} />
      {#if resolutions}
        <table>
          <thead>
            <tr>
              <th>Slug</th>
              <th>Status</th>
              <th>Select</th>
            </tr>
          </thead>
          <tbody>
            {#each Object.entries(resolutions) as [slug, resolution]}
              <tr>
                <td>{slug}</td>
                <td>
                  {#if resolution.resolved === true}
                    found
                  {:else if resolution.resolved === false}
                    {resolution.error}
                  {/if}
                </td>
                <td
                  class:success={resolution.resolved === true}
                  class:fail={resolution.resolved !== true}
                >
                  {#if resolution.resolved === true}
                    <input
                      type="checkbox"
                      on:change={checkIfAllItemsSelected}
                      bind:value={resolution.id}
                      checked={selectedResults.includes(resolution.id)}
                    />
                    <a href={`/object/edit/${resolution.id}`} target="_blank">
                      {resolution.id}
                    </a>
                  {:else}
                    <span>Can't add to collection</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
          <br />
          <button
            class="primary"
            disabled={!selectedResults.length}
            on:click={handleAddPressed}
          >
            Add Selected Items
          </button>
          <br />
          <br />
        </table>
      {/if}
    </div>
  {/if}
</div>

<style>
  .member-selector-wrap {
    padding: var(--perfect-fourth-6);
    max-height: 100%;
    overflow-y: auto;
  }
  .search-wrap {
    min-height: 100vh;
  }
  .move-button {
    display: flex;
  }
  textarea {
    display: grid;
    width: 100%;
  }
  .success {
    background-color: var(--success-light);
    color: var(--success);
  }
  .fail {
    background-color: var(--danger-light);
    color: var(--danger);
  }
</style>
