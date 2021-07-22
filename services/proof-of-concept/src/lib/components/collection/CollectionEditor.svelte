<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import { AccessObject } from "@crkn-rcdr/access-data";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import { isCollection, isManifest } from "@crkn-rcdr/access-data";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "$lib/arrayUtil";
  import { getLapin } from "$lib/lapin";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";

  //export let model: AccessObject;
  export let collection: Collection;
  export let showAddButton = true;
  export let members = collection.members[0].id;

  let indexModel: number[] = [];
  let activeMemberIndex: number = 0;
  let container: HTMLDivElement;
  let addedMember = false;
  let selectedCollection: Collection;
  let error = "";

  const LEFT_ARROW_CODE: number = 37;
  const UP_ARROW_CODE: number = 38;
  const RIGHT_ARROW_CODE: number = 39;
  const DOWN_ARROW_CODE: number = 40;

  const dispatch = createEventDispatcher();

  function setIndexModel() {
    indexModel = [];
    for (let i = 0; i < collection?.members.length; i++) {
      indexModel.push(i + 1);
    }
  }

  function setActiveIndex(index: number) {
    if (index >= collection?.members.length)
      index = collection?.members.length - 1;
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
      collection?.members,
      originalItemIndex,
      destinationItemIndex
    );
    collection.members = collection?.members;

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
    if (activeMemberIndex < collection?.members.length - 1) {
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
    dispatch("addClicked");
  }
  function deleteCanvasByIndex(event: any, index: number) {
    event.stopPropagation();
    if (index >= 0 && index < collection?.members.length) {
      collection?.members.splice(index, 1);
      collection.members = collection?.members;
      setActiveIndex(activeMemberIndex);
    }
  }
  let addedItem = "";
  let noid;
  async function handleSelect(event: any) {
    try {
      noid = event.detail;
      const lapin = getLapin();
      const response = await lapin.query("noid.resolve", noid);
      console.log(response);
      //const object = AccessObject.parse(response);
      collection.members[collection?.members.length] = noid;
      //noid = "";
      /* if (isCollection(object)) {
        selectedCollection = response;
      } else if (isManifest(object)) {
        /selectedManifest = response;
        showManifest = true; 
        error = "Error: Object is a Manifest, please select another.";
      } */
    } catch (e) {
      error = e;
    }
  }

  function handleCancelPressed() {
    console.log("selected test", activeMemberIndex);
    dispatch("done");
  }
  onMount(() => {
    console.log("Prit Collection:", collection);
    if (collection?.members.length) activeMemberIndex = 0;
    setIndexModel();
  });

  $: {
    collection?.members;
    setIndexModel();
  }
</script>

<svelte:window on:keydown={handleKeydown} />
{#if indexModel.length && collection}
  <div class="auto-align auto-align__column">
    {#if showAddButton}
      <button class="primary lg" on:click={addClicked}>Add Member</button>
    {/if}
    {#if addedMember}
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

      <div>
        <!--Todo: ask how best to limit to only manifests-->
        <TypeAhead
          label="Search for a manifest to add canvases from:"
          on:selected={handleSelect}
          on:keypress={() => (error = "")}
        />
      </div>
    {/if}

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
          <!-- usage: there needs to be one top-level component or element in here otherwise drag and drop doesnt work. I'll try to fix that/open a ticket -->
          <div
            class="thumbnail"
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
              <div>
                <ul>
                  <li>
                    <input bind:value={members["id"]} />
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
    margin-left: 0.58rem;
  }

  .action.icon {
    display: none;
    margin-top: 0.5em;
  }
  .pos-input {
    display: none;
  }
  li {
    list-style: none;
  }
  @keyframes new {
    from {
      background-color: var(--gold-light);
    }
    to {
      background-color: var(--structural-div-bg);
    }
  }

  .actions-wrap {
    flex: 1;
    margin-left: 1.5rem;
  }

  .action.icon {
    opacity: 0.6;
    cursor: pointer;
  }
</style>
