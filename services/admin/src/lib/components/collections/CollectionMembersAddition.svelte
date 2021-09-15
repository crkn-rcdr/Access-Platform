<!--Skeleton for Bulk addition-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  //import { AccessObject } from "@crkn-rcdr/access-data";

  import type { AccessPlatform } from "$lib/types";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import { createEventDispatcher } from "svelte";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  import IoIosAddCircleOutline from "svelte-icons/io/IoIosAddCircleOutline.svelte";
  import ResolveMany from "$lib/components/access-objects/ResolveMany.svelte";
  import DmdPrefixSelector from "$lib/components/dmd/DmdPrefixSelector.svelte";
  import PrefixSelector from "./PrefixSelector.svelte";

  /**
   *  @type { AccessPlatform } The access platform to look for the items in.
   */
  export let accessPlatform: AccessPlatform;

  /**
   * @type {Manifest} The manifest to add selected canvases to.
   */
  export let destinationMember: Collection;

  /**
   * @type {number} The starting index to add the selected canvases at.
   */
  export let destinationIndex = 0;
  /**
   * @type {"column" | "row"} If the information should be row or column based. If column is selected, all information will be displayed in one column. Otherwise, a 3x3 grid will be used.
   */
  export let direction: "column" | "row" = "column";
  /**
   * @type {boolean} If the user is allowed to select multiple canvases to add.
   */

  let showAddButton = false;
  /**
   * @type {Session} The session store that contains the module for sending requests to lapin.
   */
  const { session } = getStores<Session>();

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {Collection} The Collection to select members from.
   */
  //let selectedMember: AccessObject;

  /**
   * @type {ObjectList} The members the user selects.
   */

  /**
   * @type {string} If a manifest is selected.
   */
  let isMemberSelected = false;
  let addedMember = false;
  let foundSlugs: string[] = [];

  /**
   * @type {string} If the select all button is activated.
   */
  let isAllSelected = false;

  /**
   * @type {string} An error message to be displayed.
   */
  let issue = "";
  let prefix = "";

  /**
   * When a collection is selected from the table of search results, grab its details from the backend.
   * @param event
   * @returns void
   */
  function addClicked() {
    addedMember = true;
  }
  let resolveManyReturn: {} = [];
  let id: string = destinationMember.id;
  let slugArray: string[];
  let input: "";
  let validMember,
    notFoundSlug: string[] = [];

  async function resolveMembers() {
    slugArray = input.split(/[,|\s]/);
    if (prefix.length > 0) {
      slugArray = slugArray.map((slug) => prefix + slug);
    }

    const response = await $session.lapin.query("collection.checkAdditions", {
      id,
      slugArray,
    });

    console.log("response in check", Object.values(response));
    for (let checkSlug in response) {
      if (!response[checkSlug].resolved) {
        notFoundSlug.push(checkSlug);
      }
      if (response[checkSlug].resolved) {
        validMember.push(response[checkSlug].resolved);
      }
    }
    console.log("invalidmembers print", notFoundSlug);
  }
  async function handleSelect(event: any) {
    resolveManyReturn = event.detail;
    console.log("test", resolveManyReturn);
    for (let detail in resolveManyReturn) {
      if (resolveManyReturn[detail][1].found == true) {
        foundSlugs.push(resolveManyReturn[detail][1].result.id);
      } else {
        console.log("false");
      }
      foundSlugs = foundSlugs;
      showAddButton = true;
    }
  }

  function handleCancelPressed() {
    addedMember = false;
  }

  /**
   * When add is pressed, add the selected members to the begining of the destination collection's members list, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */

  async function handleAddPressed() {
    for (let index in foundSlugs) {
      destinationMember?.members?.splice(destinationIndex, 0, {
        id: foundSlugs[index],
      });
      destinationMember = destinationMember;
    }
    addedMember = false;
    isMemberSelected = true;
  }
</script>

<div class="canvas-selector-wrap add-menu">
  {#if !isMemberSelected}
    <div class="move-button">
      <button class="primary lg" on:click={addClicked}>Member LookUp</button>
      {#if addedMember}
        <button
          class="secondary cancel-button auto-align auto-align__a-center"
          on:click={handleCancelPressed}
        >
          <div class="icon">
            <TiArrowBack />
          </div>
          Exit
        </button>
      {/if}
    </div>
    {#if addedMember}
      <div>
        <!--  <ResolveMany on:found={handleSelect} /> -->
        <PrefixSelector bind:prefix />
        <textarea bind:value={input} /><br />
        <button class="primary lg" on:click={resolveMembers}>Lookup</button>
        <br />
      </div>
      <table>
        <thead>
          <tr>
            <th>Valid Slugs</th>
            <th>Not Found Slugs</th>
            <!-- <th>Already Member</th>
            <th>Is Self</th> -->
          </tr>
        </thead>
        <tbody>
          <tr>
            {#if validMember}
              {#each validMember as valid}
                <td class:success={valid} />
              {/each}
            {/if}

            {#if notFoundSlug}
              {#each notFoundSlug as invalid}
                <td class:not-success={invalid} />
              {/each}
            {/if}
          </tr>
        </tbody>
      </table>
      <!--  <div>
        {#each foundSlugs as foundMember}
          <div
            class="checkmember"
            on:click={handleAddPressed}
            data-tooltip="Add Selected Member"
            data-tooltip-flow="bottom"
          >
           
            {foundMember}
          </div>
        {/each}
        {#if showAddButton}
          <button class="primary lg" on:click={handleAddPressed}>Add</button>
        {/if}
      </div>
      <br />

      <div class="add-menu-title" />
      <br />
      {#if issue}
        <br />
        <div class="alert alert-danger">
          {issue}
        </div>
      {/if} -->
    {/if}
  {/if}
</div>

<style>
  .checkmember {
    display: flex;
    width: 100%;
    height: 50px;

    border-radius: var(--border-radius);
    padding: 0.2rem;
  }
  .checkmember {
    cursor: pointer;
  }
  .move-button {
    display: flex;
  }
  .value {
    text-align: right;
  }
  .restrict-width {
    max-width: 25rem;
  }
  .not-success {
    background-color: var(--danger-light);
    /*color: var(--danger);*/
  }
  .success {
    background-color: var(--success-light);
    color: var(--success);
  }
</style>
