<!--Skeleton for Bulk addition-->
<script lang="ts">
  import CollectionContentEditor from "./CollectionContentEditor.svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import type { ObjectList } from "@crkn-rcdr/access-data";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import { createEventDispatcher } from "svelte";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import FaPlus from "svelte-icons/fa/FaPlus.svelte";
  import ResolveMany from "$lib/components/access-objects/ResolveMany.svelte";

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
  export let multiple = true;
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
   * @type {Collection} The manifest to select canvases from.
   */
  let selectedMember: AccessObject;

  /**
   * @type {ObjectList} The canvases the user selects.
   */
  let selectedMembers: ObjectList = [];

  /**
   * @type {string} If a manifest is selected.
   */
  let isMemberSelected = false;
  let addedMember = false;

  /**
   * @type {string} If the select all button is activated.
   */
  let isAllSelected = false;

  /**
   * @type {string} An error message to be displayed.
   */
  let error = "";

  /**
   * When a manifest is selected from the table of search results, grab its details from the backend.
   * @param event
   * @returns void
   */
  function addClicked() {
    addedMember = true;
  }
  async function handleSelect(event: any) {
    try {
      let prefixedNoid = event.detail;
      const response = await $session.lapin.query(
        "accessObject.get",
        prefixedNoid
      );
      console.log("Print the member response", response);
      if (response) {
        const object = AccessObject.parse(response);
        if (object) {
          selectedMember = object;
          console.log("selected Member", selectedMember);
          isMemberSelected = true;
        }
      } else {
        error = response.toString();
      }
    } catch (e) {
      error = e;
    }
  }
  function handleCancelPressed() {
    selectedMembers = [];
    dispatch("done");
  }

  /**
   * When add is pressed, add the selected canvases to the begining of the destination manifest's canvases list, and signify to the parent through the @event done that the user is done adding canvases
   * @returns void
   */
  function handleAddPressed() {
    destinationMember?.members?.splice(destinationIndex, 0, ...selectedMembers);
    destinationMember = destinationMember;
    selectedMembers = [];
    dispatch("done");
  }
</script>

<div class="canvas-selector-wrap add-menu">
  {#if !isMemberSelected}
    {#if showAddButton}
      <button class="primary lg" on:click={addClicked}>Add Member</button>
    {/if}
    {#if addedMember}
      <div>
        <!-- <TypeAhead
          placeholder="Search for a Collection Or Manifest to add from..."
          on:selected={handleSelect}
          on:keypress={() => (error = "")}
        /> -->
        <ResolveMany bind:slugList={AccessObject["slug"]} />
      </div>
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
  {:else}
    {#if multiple}
      <div class="manifest-controls auto-align auto-align__a-center">
        <div
          class="icon"
          on:click={() => {
            error = "";
            isMemberSelected = false;
          }}
          data-tooltip="Go back to manifest search"
          data-tooltip-flow="bottom"
        >
          <TiArrowBack />
        </div>
      </div>
    {/if}
    {#if selectedMembers.length}
      <div
        class="icon add-all-button"
        on:click={handleAddPressed}
        data-tooltip="Add selected canvases"
        data-tooltip-flow="bottom"
      >
        <FaPlus />
      </div>
    {/if}
    <div
      data-tooltip={`${isAllSelected ? "Deselect" : "Select"} all`}
      data-tooltip-flow="bottom"
    />
    <!--  <img
      class="icon select-all"
      src={`/static/icons/${isAllSelected ? "deselect.png" : "select.svg"}`}
      alt="select all"
      on:click={() => (isAllSelected = !isAllSelected)}
    /> -->
    {#if selectedMembers.length}
      <div class="selected-canvas-list">
        {selectedMembers.length}/{selectedMember?.["members"]?.length}
      </div>
    {/if}
  {/if}
</div>
