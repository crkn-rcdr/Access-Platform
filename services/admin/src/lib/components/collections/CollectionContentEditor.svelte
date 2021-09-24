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
  import { session } from "$app/stores";

  export let collection: Collection;
  let activeMemberIndex: number = 0;
  const dispatch = createEventDispatcher();

  function setActiveIndex(index: number) {
    if (index >= collection.members.length)
      index = collection.members.length - 1;
    if (index < 0) index = 0;
    activeMemberIndex = index;
    dispatch("membersClicked", { index });
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
    //jumpTo(activeMemberIndex);
    setActiveIndex(activeMemberIndex);
  }
  function deleteMemberByIndex(event: any, index: number) {
    event.stopPropagation();
    if (index >= 0 && index < collection?.members.length) {
      collection?.members.splice(index, 1);
      collection.members = collection?.members;
      setActiveIndex(activeMemberIndex);
    }
  }
  async function getMemberContext() {
    let currentMembers = collection.members.map((members) => members.id);
    
    const resolutions = await $session.lapin.query(
      "collection.viewMembersContext",
      currentMembers
    );
    console.log("know what it retrieves", resolutions);
  }
  onMount(() => {
    if (collection.members.length) activeMemberIndex = 0;
  });
</script>

{#if collection}
  <div>
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
      draggable={collection.behavior !== "unordered"}
      let:item
    >
      <div
        class="members"
        class:active={item?.id === activeMemberIndex}
        on:mousedown={() => setActiveIndex(item?.id)}
      >
        <div class="auto-align">
          <div class="actions-wrap">
            <div class="auto-align auto-align__column">
              {#if collection.behavior !== "unordered"}
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
                    value={item?.pos}
                    on:changed={(e) => {
                      moveMember(e, item?.id);
                    }}
                  />
                </div>
              {/if}
              <div
                class="action icon"
                on:click={(e) => deleteMemberByIndex(e, item.id)}
              >
                <TiTrash />
              </div>
            </div>
          </div>
          <div id="grid">
            <ul>
              <li>
                <a href="/object/{item?.data?.id}">{item?.data?.id}</a><br />

                <!--  {#each collection.members as members} -->
                <!--   <textarea
                    id="label"
                    name="label"
                    bind:value={collection.members["label"]["none"]}
                  /> -->
                <!--   {/each} -->
              </li>
            </ul>
            <button on:click={getMemberContext}>Check</button>
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
