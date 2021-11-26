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
  import { onMount, createEventDispatcher, afterUpdate } from "svelte";
  import type { PagedCollection } from "@crkn-rcdr/access-data/src/access/Collection";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import CollectionMembersAddition from "./CollectionMembersAddition.svelte";
  import { session } from "$app/stores";
  import InfiniteScroller from "../shared/InfiniteScroller.svelte";
  import type { ObjectListPage } from "@crkn-rcdr/access-data";
  import DynamicDragAndDropList from "../shared/DynamicDragAndDropList.svelte";
  import DynamicDragAndDropListItem from "../shared/DynamicDragAndDropListItem.svelte";
  import { showConfirmation } from "$lib/utils/confirmation";
  import Loading from "../shared/Loading.svelte";

  export let collection: PagedCollection;

  /**
   * First page of members in the object.
   */
  export let firstPage: ObjectListPage;

  /**
   * The number of children in the object.
   */
  export let childrenCount: number;

  let activeMemberIndex: number = 0;
  const dispatch = createEventDispatcher();
  let documentSlug: any[] = [];
  let members: { id?: string; label?: Record<string, string> }[] = [];
  /**
   * @type {string} A control for what component is displayed in the free space of the content editor.
   */
  let state = "view";
  /**
   * Sets @var state to the newState passed in.
   * @param newState
   * @returns void
   */
  /**
   * @type {number} Shows the number of pages
   */
  let page: number = 0;
  let size: number = 100;

  let previousLastItem: string | null = null;

  let loading: boolean = false;

  let list: HTMLElement;

  function changeView(newState: string) {
    state = newState;
  }

  async function getMemberContext(
    newMembers: { id?: string; label?: Record<string, string> }[]
  ) {
    let currentMembers = newMembers.map((members) => members.id);

    const resolutions = await $session.lapin.query(
      "collection.viewMembersContext",
      currentMembers
    );

    console.log("know what it retrieves", resolutions);
    documentSlug = [
      ...documentSlug,
      ...resolutions.map((slug) => {
        return { id: slug[0], result: slug[1].result };
      }),
    ];
  }
  function setActiveIndex(index: number) {
    if (index >= collection?.members?.count)
      index = collection.members.count - 1;
    if (index < 0) index = 0;
    activeMemberIndex = index;
    dispatch("membersClicked", { index });
  }
  function moveMember(event: any, originalItemIndex: number) {
    //TODO: use new API to move member

    // Move the member and trigger saving
    /*let destinationItemIndex = parseInt(event.detail.value) - 1;
    moveArrayElement(
      collection.members,
      originalItemIndex,
      destinationItemIndex
    );
    collection.members = collection.members;*/
    // Highlight and move to new position
    //activeMemberIndex = destinationItemIndex;
    //jumpTo(activeMemberIndex);

    setActiveIndex(activeMemberIndex);
  }
  function deleteMemberByIndex(event: any, index: number) {
    event.stopPropagation();

    if (index >= 0 && index < collection?.members?.count) {
      //TODO: use new API to delete by index
      /*collection?.members.splice(index, 1);
      collection.members = collection?.members;
      setActiveIndex(activeMemberIndex);*/
    }
  }

  async function handleScroll(event) {
    {
      if (loading) return;
      loading = true;
      if (event.detail.reverse) {
        page--;
        console.log("load prev");
        const currPage = await $session.lapin.query("collection.pageBefore", {
          id: collection.id,
          before: members[0].id,
          limit: size,
        });
        previousLastItem = members[members.length - 1].id;
        members = currPage.list;
        await getMemberContext(currPage.list);
      } else {
        page++;
        console.log("load next");
        const currPage = await $session.lapin.query("collection.pageAfter", {
          id: collection.id,
          after: members[members.length - 1].id,
          limit: size,
        });
        previousLastItem = members[members.length - 1].id;
        members = currPage.list;
        await getMemberContext(currPage.list);
      }
    }
    loading = false;
  }

  async function handleItemDropped(event: {
    detail: { currentItemIndex: number; destinationItemIndex: number };
  }) {
    if (loading) return;
    loading = true;
    console.log("Drag info", event.detail);
    if (
      event.detail.currentItemIndex >= 0 &&
      event.detail.currentItemIndex < members.length
    ) {
      const pagedDestinationIndex =
        page * size + event.detail.destinationItemIndex;

      const memberToMove = members[event.detail.currentItemIndex];

      const data = {
        id: collection.id,
        members: [memberToMove.id],
        toIndex: pagedDestinationIndex,
        user: $session.user,
      };
      console.log(data);

      // Shows a notification on move failure
      await showConfirmation(
        async () => {
          try {
            const response = await $session.lapin.mutation(
              "collection.moveMembers",
              data
            );
            console.log("done 1");
            return {
              success: true,
              details: "",
            };
          } catch (e) {
            return {
              success: false,
              details: e.message,
            };
          }
        },
        "",
        "Error: failed to move member.",
        true
      );

      // Shows a notification on page grab failure
      await showConfirmation(
        async () => {
          try {
            // we can just grab the current page again instead, but we need to store the previous page's last item to do so.
            const currPage = await $session.lapin.query(
              "collection.pageAfter",
              {
                id: collection.id,
                after: previousLastItem,
                limit: size,
              }
            );
            members = currPage.list;
            console.log("done 2");
            return {
              success: true,
              details: "",
            };
          } catch (e) {
            return {
              success: false,
              details: e.message,
            };
          }
        },
        "",
        "Error: failed to update page. Please refresh.",
        true
      );
    } else {
      console.log("invalid index");
    }

    loading = false;
  }

  onMount(async () => {
    activeMemberIndex = 0;
    console.log("firstPage", firstPage);
    members = firstPage.list;
    getMemberContext(firstPage.list);
  });
</script>

{#if collection}
  <div>
    <CollectionMembersAddition
      showAddButton={state != "add"}
      bind:destinationMember={collection}
      bind:contextDisplay={documentSlug}
      on:done={() => {
        setActiveIndex(0);
      }}
      on:addClicked={() => {
        changeView("add");
        collection = collection;
        console.log("collection", collection);
      }}
    />
    <br />

    <br />
    <!--
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

                {#each documentSlug as document}
                  {#if document["result"]?.["label"]?.["none"] && document["id"] === item?.data?.id}
                    {document["result"]["slug"]} : {document["result"]["label"][
                      "none"
                    ]}
                  {/if}
                {/each}
              </li>
            </ul>
          </div>
        </div>
      </div-->
    <br />

    <!-- I commented out the above and added the styling from the example to help me see what's going on.
    -->

    <div class="member-wrap" class:disabled={loading}>
      <!-- loop through the array where items are added when scrolling -->
      <DynamicDragAndDropList
        bind:container={list}
        on:itemDropped={handleItemDropped}
      >
        {#each members as collectionmembers, i}
          <DynamicDragAndDropListItem pos={i + 1}>
            <div class="member">
              {collectionmembers.id}
              {#each documentSlug as document}
                {#if document["result"]?.["label"]?.["none"] && document["id"] === collectionmembers?.id}
                  {document["result"]["slug"]} : {document["result"]["label"][
                    "none"
                  ]}
                {/if}
              {/each}
            </div>
          </DynamicDragAndDropListItem>
        {/each}
      </DynamicDragAndDropList>
      <InfiniteScroller
        elementScroll={list}
        hasLess={page !== 0}
        hasMore={childrenCount > page * size + members.length}
        threshold={100}
        on:loadMore={handleScroll}
      />
    </div>
    <div class="auto-align auto-align__a-center">
      {#if loading}
        <span class="page-info-loader">
          <Loading size="sm" backgroundType="gradient" />
        </span>
      {/if}
      <span class="page-info">
        Showing {page * size + 1} to {page * size + members.length} of {childrenCount}
      </span>
    </div>
  </div>
{/if}

<style>
  /* .action.icon {
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
  #grid {
    margin-top: 1rem;
    height: 5rem;
    display: grid;
    grid-template-areas: "a a";
    gap: 10px;
    grid-auto-columns: 200px;
  } */

  .member-wrap {
    display: flex;
    flex-direction: column;
    border-radius: 2px;
    width: 75%;
    max-width: 100%;
    max-height: 38rem;
    background-color: white;
    overflow-x: hidden;
    padding: 0;
  }

  .member-wrap.disabled {
    opacity: 0.5;
    overflow: hidden;
    pointer-events: none;
    user-select: none;
  }

  :global(.member-wrap.disabled > *) {
    overflow: hidden;
    pointer-events: none;
    user-select: none;
  }

  .member:hover {
    background-color: #eeeeee;
  }
  .page-info-loader {
    margin-right: var(--margin-sm);
  }
</style>
