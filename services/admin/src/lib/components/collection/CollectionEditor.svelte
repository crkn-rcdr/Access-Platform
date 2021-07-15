<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";
  //import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isCollection } from "@crkn-rcdr/access-data";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import Switch from "$lib/components/shared//Switch.svelte";
  import SwitchCase from "$lib/components/shared//SwitchCase.svelte";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "$lib/arrayUtil";

  //export let model: AccessObject;
  export let collection: Collection;
  export let showAddButton = true;
  let indexModel: number[] = [];
  let activeMemberIndex: number = 0;
  let container: HTMLDivElement;
  const dispatch = createEventDispatcher();
  console.log("Prit Collection:", collection);

  //let activeMember: Members | null;
  //let state = "view";
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
  }
  function jumpTo(index: number) {
    let membersThumbnails = container.querySelectorAll(".thumbnail");
    membersThumbnails?.[index]?.scrollIntoView();
  }
  function moveMember(event: any, originalItemIndex: number) {
    // Move the canvas and trigger saving
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

  function setMemberList(index: number) {
    activeMember = collection?.members?.[index] || null;
    console.log("Check if there is activeMember in memberlist", activeMember);
    triggerUpdate();
  }
  function triggerUpdate() {
    collection.members = collection.members;
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
{#if indexModel.length}
  <div class="auto-align auto-align__column">
    {#if showAddButton}
      <button class="primary lg" on:click={addClicked}>Add Canvas</button>
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
            <div class="image-wrap">
              <input bind:value={members["id"]} class="thumbnail-img" />
            </div>
          </div>
        {/each}
      </DynamicDragAndDropList>
    </div>
  </div>
{/if}
