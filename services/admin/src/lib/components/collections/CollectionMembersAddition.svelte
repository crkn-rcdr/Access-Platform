<!--Skeleton for Bulk addition-->
<script lang="ts">
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import { AccessObject } from "@crkn-rcdr/access-data";

  import type { ObjectList } from "@crkn-rcdr/access-data";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import { createEventDispatcher } from "svelte";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import FaCheckCircle from "svelte-icons/fa/FaCheckCircle.svelte";
  import IoIosAddCircleOutline from "svelte-icons/io/IoIosAddCircleOutline.svelte";
  import ResolveMany from "$lib/components/access-objects/ResolveMany.svelte";

  type ResolveManyReturn = [
    string,
    (
      | {
          found: false;
        }
      | {
          found: true;
          result: {
            type: "alias" | "manifest" | "collection";
            id: string;
          };
        }
    )
  ][];

  /**
   * @type {Manifest} The manifest to add selected canvases to.
   */
  export let destinationMember: Collection;

  /**
   * @type {number} The starting index to add the selected canvases at.
   */
  export let destinationIndex = 0;

  /**
   * @type {boolean} If the user is allowed to select multiple canvases to add.
   */

  export let showAddButton = true;
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
  let selectedMember: AccessObject;

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
  let error = "";

  /**
   * When a collection is selected from the table of search results, grab its details from the backend.
   * @param event
   * @returns void
   */
  function addClicked() {
    addedMember = true;
  }
  let resolveManyReturn: ResolveManyReturn = [];

  async function handleSelect(event: { detail: ResolveManyReturn }) {
    resolveManyReturn = event.detail;
    console.log("test", resolveManyReturn);
    // let testArray: [] = [];
    for (let detail in resolveManyReturn) {
      let test = resolveManyReturn[detail][1];
      if (test.found == true) {
        foundSlugs.push(test.result.id);
      } else {
        console.log("false");
      }
      foundSlugs = foundSlugs;
    }
  }
  console.log("found", foundSlugs);

  function handleCancelPressed() {
    addedMember = false;
  }

  /**
   * When add is pressed, add the selected members to the begining of the destination collection's members list, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */
  let test: ObjectList = [];
  async function handleAddPressed() {
    console.log("destination.members", foundSlugs);
   
    destinationMember.members[destinationMember.members.length] = {
      id: foundSlugs,
    };

    destinationMember = destinationMember;

    addedMember = false;
    isMemberSelected = true;
    dispatch("done");
  }
</script>

<div class="canvas-selector-wrap add-menu">
  {#if !isMemberSelected}
    {#if showAddButton}
      <button class="primary lg" on:click={addClicked}>Member LookUp</button>
    {/if}

    {#if addedMember}
      <div>
        <ResolveMany on:found={handleSelect} />
        <br />
      </div>
      <div>
        {#each foundSlugs as foundMember}
          <div
            class="checkmember"
            on:click={handleAddPressed}
            data-tooltip="Add Selected Member"
            data-tooltip-flow="bottom"
          >
            <FaCheckCircle />
            {foundMember}
          </div>
        {/each}
      </div>
      <br />
      <button class="primary lg" on:click={handleAddPressed}>Add</button>

      <div class="add-menu-title">
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
      <br />
      {#if error}
        <br />
        <div class="alert alert-danger">
          {error}
        </div>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .grid {
    display: grid;
    background-color: var(--primary-light);
    grid-column: 1/1;
    width: 100%;
  }
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
</style>
