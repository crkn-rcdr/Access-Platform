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
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";
  import type { Session } from "$lib/types";
  import { getStores } from "$app/stores";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import DynamicDragAndDropList from "$lib/components/shared/DynamicDragAndDropList.svelte";
  import { moveArrayElement } from "$lib/utils/arrayUtil";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import CollectionMembersAddition from "./CollectionMembersAddition.svelte";
  import DynamicDragAndDropListItem from "../shared/DynamicDragAndDropListItem.svelte";
  import VirtualList from "../shared/VirtualList.svelte";

  export let collection: Collection;
  export let showAddButton = true;

  let indexModel: any = {};
  let activeMemberIndex: number = 0;
  let container: HTMLDivElement;

  let state: string;
  const LEFT_ARROW_CODE: number = 37;
  const UP_ARROW_CODE: number = 38;
  const RIGHT_ARROW_CODE: number = 39;
  const DOWN_ARROW_CODE: number = 40;
  const dispatch = createEventDispatcher();
  const { session } = getStores<Session>();
  function setIndexModel() {
    indexModel = {};
    for (let i = 0; i < collection.members.length; i++) {
      indexModel[collection.members[i]["id"]] = i + 1;
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

  function deleteCanvasByIndex(event: any, index: number) {
    event.stopPropagation();
    if (index >= 0 && index < collection?.members.length) {
      collection?.members.splice(index, 1);
      collection.members = collection?.members;
      setActiveIndex(activeMemberIndex);
    }
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

<svelte:window on:keydown={handleKeydown} />
{#if indexModel && collection}
  <div class="auto-align auto-align__column wrapper">
    <CollectionMembersAddition
      bind:destinationMember={collection}
      on:done={() => {
        state = "view";
        setActiveIndex(0);
      }}
    />
    <br />

    <div
      bind:this={container}
      tabindex="0"
      class="list"
      class:disabled={!showAddButton}
    >
      {#if collection?.members}
        <VirtualList
          on:itemDropped={(e) => {
            console.log("drop");
            setActiveIndex(e.detail.destinationItemIndex);
          }}
          let:item
        >
          <div
            class="members"
            class:active={indexModel[item["id"]] === activeMemberIndex}
            on:mousedown={() => setActiveIndex(indexModel[item["id"]])}
          >
            <div class="auto-align">
              <div class="actions-wrap">
                <div class="auto-align auto-align__column">
                  <div class="action pos">
                    {indexModel[item["id"]]}
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
                        moveMember(e, indexModel[item["id"]]);
                      }}
                      bind:value={indexModel[item["id"]]}
                    />
                  </div>
                  <div
                    class="action icon"
                    on:click={(e) =>
                      deleteCanvasByIndex(e, indexModel[item["id"]])}
                  >
                    <TiTrash />
                  </div>
                </div>
              </div>
              <div id="grid">
                <ul>
                  <li>
                    <a href="/object/{item['id']}">{item["id"]}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </VirtualList>
      {/if}
=======
</style>
