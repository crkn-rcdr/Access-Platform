<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "$lib/arrayUtil";

  export let collection: Collection;
  export let members: {} = Object.values(collection.members);
  export let showAddButton = true;
  let indexModel: number[] = [];
  let activeMemberIndex: number = 0;
  let container: HTMLDivElement;

  const LEFT_ARROW_CODE: number = 37;
  const UP_ARROW_CODE: number = 38;
  const RIGHT_ARROW_CODE: number = 39;
  const DOWN_ARROW_CODE: number = 40;

  const dispatch = createEventDispatcher();
  console.log("Prit Collection:", collection);

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
    dispatch("addClicked");
  }
  onMount(() => {
    if (collection.members.length) activeMemberIndex = 0;
    setIndexModel();
  });

  $: {
    collection.members;
    setIndexModel();
  }
</script>

<div class="editor">
  <!-- {#if isCollection(model)}
    <label for="Type">Type</label><br />
    <input type="text" id="type" name="type" bind:value={model["type"]} /><br />
  {/if}
  {#if isCollection(model)}
    <label for="public">Public</label><br />
    <input
      type="text"
      id="public"
      name="public"
      bind:value={model["public"]}
    /><br />
  {/if} -->
</div>
<svelte:window on:keydown={handleKeydown} />
{#if indexModel.length}
  <div class="auto-align auto-align__column">
    {#if showAddButton}
      <button class="primary lg" on:click={addClicked}>Add Member</button>
    {/if}
    <div
      bind:this={container}
      tabindex="0"
      class="list"
      class:disabled={!showAddButton}
    >
      {#if indexModel.length}
        <DynamicDragAndDropList
          bind:dragList={collection.members}
          on:itemDropped={(e) => {
            setActiveIndex(e.detail.destinationItemIndex);
          }}
        >
          {#each collection.members as members, i}
            <div
              class="thumbnail"
              class:active={i === activeMemberIndex}
              on:mousedown={() => setActiveIndex(i)}
            />
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
                      max={collection.members.length}
                      on:changed={(e) => {
                        moveMember(e, i);
                      }}
                      bind:value={indexModel[i]}
                    />
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
          {/each}
        </DynamicDragAndDropList>
      {/if}
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
</style>
