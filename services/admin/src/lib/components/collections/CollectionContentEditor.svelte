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
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import VirtualList from "$lib/components/shared/VirtualList.svelte";
  import { moveArrayElement } from "$lib/utils/arrayUtil";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import CollectionMembersAddition from "./CollectionMembersAddition.svelte";

  export let collection: Collection;
  export let showAddButton = true;
  let activeMemberIndex: number = 0;
  let container: HTMLDivElement;

  const dispatch = createEventDispatcher();

  function setActiveIndex(index: number) {
    if (index >= collection.members.length)
      index = collection.members.length - 1;
    if (index < 0) index = 0;
    activeMemberIndex = index;
    dispatch("membersClicked", { index });
    collection.members = collection.members;
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
    // Highlight and move to new position
    activeMemberIndex = destinationItemIndex;

    jumpTo(activeMemberIndex);
    setActiveIndex(activeMemberIndex);
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
  });
</script>

{#if collection}
  <div class="auto-align auto-align__column">
    <CollectionMembersAddition
      bind:destinationMember={collection}
      on:done={() => {
        setActiveIndex(0);
      }}
    />
    <br />

    <VirtualList
      bind:dataList={collection.members}
      bind:activeIndex={activeMemberIndex}
      disabled={!showAddButton}
      let:item
    >
      <div
        class="members"
        class:active={item.pos - 1 === activeMemberIndex}
        on:mousedown={() => setActiveIndex(item.pos - 1)}
      >
        <div class="auto-align">
          <div class="actions-wrap">
            <div class="auto-align auto-align__column">
              <div class="action pos">
                {item.pos}
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
                  value={item.pos}
                  on:changed={(e) => {
                    moveMember(e, item.pos - 1);
                  }}
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
                <a href="/object/{item.id}">{item.id}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </VirtualList>
  </div>
{/if}

<style>
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
