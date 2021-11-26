<script lang="ts">
  import type { Depositor, Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import { createEventDispatcher } from "svelte";
  import type { PagedCollection } from "@crkn-rcdr/access-data/src/access/Collection";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";

  import PrefixSelector from "$lib/components/access-objects/PrefixSelector.svelte";
  import ToggleButtons from "$lib/components/shared/ToggleButtons.svelte";

  /**
   * @type {PagedCollection} The Collection where the members are added to.
   */
  export let destinationMember: PagedCollection;
  /**
   * To bind the context of members value.
   */
  export let contextDisplay;

  /**
   * @type {number} The starting index to add the selected canvases at.
   */
  export let destinationIndex = 0;

  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {string} If a Collection is selected.
   */
  let isMemberSelected = false;
  let addedMember = false;

  /**
   * @type {boolean} If the add button should be displayed over the list of members.
   */
  export let showAddButton = true;
  /**
   * @type {string} An prefix to the Depositor.
   */
  let depositor: Depositor = {
    prefix: "none",
    label: "",
  };
  /**
   * @type { string } The label for the by-slug toggle
   */
  const LOOKUP_MEMBER = "Add a member";

  /**
   * @type { string } The selected lookup method
   */
  let memberLookup: string = LOOKUP_MEMBER;
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
  function addClicked() {
    addedMember = true;
    dispatch("addClicked");
  }

  let id: string = destinationMember.id;
  let slugArray: string[];
  let input: "";
  //  let documentSlug: {} = [];

  // https://github.com/sindresorhus/type-fest/blob/main/source/promise-value.d.ts
  type PromiseValue<PromiseType> = PromiseType extends PromiseLike<infer Value>
    ? PromiseValue<Value>
    : PromiseType;
  let resolutions: PromiseValue<ReturnType<typeof resolveMembers>>;

  async function resolveMembers() {
    let slugArray = input.split(/[,|\s]/);

    if (depositor?.prefix !== "none")
      slugArray = slugArray.map((slug) => `${depositor?.prefix}.${slug}`);

    if (id) {
      const response = await $session.lapin.query("collection.checkAdditions", {
        id,
        slugArray,
      });

      resolutions = response;
      showAddButton = false;

      // I'm returning here so that we can type `resolutions` properly (see above)
      return response;
    } else {
      const response = await $session.lapin.query("slug.lookupMany", slugArray);

      resolutions = Object.fromEntries(
        response.map(([slug, r]): [string, any] => {
          if (r.found) {
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
      showAddButton = false;

      // I'm returning here so that we can type `resolutions` properly (see above)
      return response;
    }
  }

  function handleCancelPressed() {
    addedMember = false;
    showAddButton = true;
    clearText();
    dispatch("done");
  }

  /**
   * When add is pressed, add the selected members to the begining of the destination collection's members list, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */
  let resultArray: string[] = [];
  function checkIfAllItemsSelected(event) {
    if (!event.target.checked) {
      const index = resultArray.indexOf(event.target.value);
      if (index > -1) {
        resultArray.splice(index, 1);
      }
    } else {
      resultArray.push(event.target.value);
    }
  }

  async function handleAddPressed() {
    console.log("adding", resultArray);
    dispatch("done", {
      selectedMembers: resultArray,
    });
    contextDisplay = contextDisplay;
    destinationMember = destinationMember;

    addedMember = false;
    showAddButton = true;
    resultArray = [];
    resolutions = {};
    clearText();
  }
  function clearText() {
    input = "";
    depositor = {
      prefix: "none",
      label: "",
    };
  }
</script>

<div class="canvas-selector-wrap add-menu">
  <div
    class="move-button auto-align auto-align__full auto-align auto-align__column"
  >
    {#if showAddButton}
      <!--  <button class="primary lg" on:click={addClicked}>Member LookUp</button> -->
      <ToggleButtons
        activeIndex={memberLookup === LOOKUP_MEMBER ? 0 : 1}
        color={lookupDone ? "secondary" : "primary"}
        options={[LOOKUP_MEMBER]}
        on:select={addClicked}
      />
    {/if}
    {#if addedMember}
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
  {#if addedMember}
    <div>
      <PrefixSelector bind:depositor />
      <textarea
        rows="4"
        placeholder="Enter a list of slugs seperated by commas or new lines."
        bind:value={input}
      /><br /> <br />
      <button class="primary lg" on:click={resolveMembers}>Lookup</button>
      <button class="primary lg" on:click={clearText}>Clear Text</button>
      <br />
    </div>
    <br />
    {#if !showAddButton}
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
                <td class="success">
                  {#if resolution.resolved === true}
                    <input
                      type="checkbox"
                      on:change={checkIfAllItemsSelected}
                      bind:value={resolution.id}
                    />
                    {resolution.id}
                  {:else}
                    <span>No ID resolved to add</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
          <br />
          <button class="primary lg" on:click={handleAddPressed}>Add</button>
          <br />
          <br />
        </table>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .move-button {
    display: flex;
  }
  .exit-button {
    padding-left: 50%;
  }
  textarea {
    display: grid;

    width: 100%;
  }

  .success {
    background-color: var(--success-light);
    color: var(--success);
  }
</style>
