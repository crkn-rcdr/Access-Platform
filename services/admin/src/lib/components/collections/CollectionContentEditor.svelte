<!--
@component

TODO

### Overview
Allows the user to modify the member list for a collection.
### Properties
|    |    |    |
| -- | -- | -- |
| collection : Collection    | required | The collection thats contents should be edited. |
### Usage
```  
<CollectionContentEditor bind:collection />
```
*Note: `bind:` is required for changes to the object to be reflected in higher level components.*
-->
<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { AccessObject } from "@crkn-rcdr/access-data";
  //import { isCollection, isManifest } from "@crkn-rcdr/access-data";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "$lib/utils/arrayUtil";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import type { ObjectList } from "@crkn-rcdr/access-data";
  import CollectionMembersAddition from "./CollectionMembersAddition.svelte";

  export let collection: Collection;
  export let showAddButton = true;

  let indexModel: number[] = [];
  let activeMemberIndex: number = 0;
  let container: HTMLDivElement;
  let addedMember = false;
  let selectedCollection: ObjectList = [];
  let error = "";
  let state = "view";
  const LEFT_ARROW_CODE: number = 37;
  const UP_ARROW_CODE: number = 38;
  const RIGHT_ARROW_CODE: number = 39;
  const DOWN_ARROW_CODE: number = 40;
  const dispatch = createEventDispatcher();
  const { session } = getStores<Session>();
  function setIndexModel() {
    indexModel = [];
    for (let i = 0; i < collection.members.length; i++) {
      indexModel.push(i + 1);
    }
  }
  function setActiveIndex(index: number) {
    if (index >= collection.members.length)
      index = collection.members.length - 1;
    if (index < 0) index = 0;
    activeMemberIndex = index;
    dispatch("membersClicked", { index });
  }
  function jumpTo(index: number) {
    let membersThumbnails = container.querySelectorAll(".thumbnail");
    membersThumbnails?.[index]?.scrollIntoView();
  }
  function moveMember(event: any, originalItemIndex: number) {
    // Move the member and trigger saving
    let destinationItemIndex = parseInt(event.detail.value) - 1;
    moveArrayElement(
      collection.members,
      originalItemIndex,
      destinationItemIndex
    );
    collection.members = collection.members;
    // Update the position inputs
    setIndexModel();
    // Highlight and move to new position
    activeMemberIndex = destinationItemIndex;
    jumpTo(activeMemberIndex);
    setActiveIndex(activeMemberIndex);
  }
  function selectPrevious() {
    if (activeMemberIndex > 0) {
      activeMemberIndex--;
      jumpTo(activeMemberIndex);
      setActiveIndex(activeMemberIndex);
    }
  }
  function selectNext() {
    if (activeMemberIndex < collection.members.length - 1) {
      activeMemberIndex++;
      jumpTo(activeMemberIndex);
      setActiveIndex(activeMemberIndex);
    }
  }
  function handleKeydown(event: any) {
    if (event.keyCode === LEFT_ARROW_CODE || event.keyCode === UP_ARROW_CODE) {
      selectPrevious();
    } else if (
      event.keyCode === RIGHT_ARROW_CODE ||
      event.keyCode === DOWN_ARROW_CODE
    ) {
      selectNext();
    }
  }

  function addClicked() {
    addedMember = true;
  }
  function deleteCanvasByIndex(event: any, index: number) {
    event.stopPropagation();
    if (index >= 0 && index < collection?.members.length) {
      collection?.members.splice(index, 1);
      collection.members = collection?.members;
      setActiveIndex(activeMemberIndex);
    }
  }
  /* let noid;
  async function handleSelect(event: any) {
    try {
      noid = event.detail;
      const response = await $session.lapin.query("accessObject.get", noid);
      if (response) {
        const object = AccessObject.parse(response);
        collection.members[collection.members.length] = object;
        addedMember = false;
      }
    } catch (e) {
      error = e;
    }
  }
  function handleCancelPressed() {
    selectedCollection = [];
    addedMember = false;
  } */
  onMount(() => {
    if (collection.members.length) activeMemberIndex = 0;
    setIndexModel();
  });
  $: {
    collection.members;
    setIndexModel();
  }
</script>

<svelte:window on:keydown={handleKeydown} />
{#if indexModel && collection}
  <div class="auto-align auto-align__column">
    <CollectionMembersAddition
      bind:destinationMember={collection}
      on:done={() => {
        state = "view";
        setActiveIndex(0);
      }}
    />
    <br />

    <!-- {#if showAddButton}
      <button class="primary lg" on:click={addClicked}>Add Member</button>
    {/if}
    {#if addedMember}
      <div>
        <TypeAhead
          placeholder="Search for a Collection Or Manifest to add from..."
          on:selected={handleSelect}
          on:keypress={() => (error = "")}
        />
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
    {/if} -->
    <div
      bind:this={container}
      tabindex="0"
      class="list"
      class:disabled={!showAddButton}
    >
      <DynamicDragAndDropList
        bind:dragList={collection.members}
        on:itemDropped={(e) => {
          setActiveIndex(e.detail.destinationItemIndex);
        }}
      >
        {#each collection?.members as members, i}
          <div
            class="members"
            class:active={i === activeMemberIndex}
            on:mousedown={() => setActiveIndex(i)}
          >
            <div class="auto-align">
              <div class="actions-wrap">
                <div class="auto-align auto-align__column">
                  <div class="action pos">
                    {indexModel[i]}
                  </div>
                  <div
                    class="action pos-input"
                    on:click={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <AutomaticResizeNumberInput
                      name="position"
                      max={collection?.members.length}
                      on:changed={(e) => {
                        moveMember(e, i);
                      }}
                      bind:value={indexModel[i]}
                    />
                  </div>
                  <div
                    class="action icon"
                    on:click={(e) => deleteCanvasByIndex(e, i)}
                  >
                    <TiTrash />
                  </div>
                </div>
              </div>
              <div id="grid">
                <ul>
                  <li>
                    <a href="/object/{members['id']}">{members["id"]}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        {/each}
      </DynamicDragAndDropList>
    </div>
  </div>
{/if}

<style>
  .list {
    position: relative;
    flex: 9;
    width: 100%;
    overflow-y: auto;
  }
  .list.disabled {
    overflow-y: hidden;
    opacity: 0.5;
  }
  /*  .actions-wrap {
  .actions-wrap {
    flex: 1;
    margin-left: 1.5rem;
  } */
  .action.icon {
    opacity: 0.6;
    cursor: pointer;
  }
  .pos {
    font-weight: 400;
    margin-top: 0.58rem;
    margin-top: 2rem;
    margin-left: 0.58rem;
  }
  .action.icon {
    display: none;
    margin-top: 0.5em;
  }
  .members:hover .action.icon {
    display: inherit;
  }
  .pos-input {
    display: none;
  }
  .members:hover .pos-input {
    display: inherit;
  }
  .members:hover .pos {
    display: none;
  }
  li {
    list-style: none;
  }
  #grid {
    margin-top: 1rem;
    height: 5rem;
    display: grid;
    grid-template-areas: "a a";
    gap: 10px;
    grid-auto-columns: 200px;
  }
</style>
