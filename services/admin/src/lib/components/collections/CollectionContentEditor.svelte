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
  import type { PagedCollection } from "@crkn-rcdr/access-data/src/access/Collection";
  import AutomaticResizeNumberInput from "$lib/components/shared/AutomaticResizeNumberInput.svelte";
  import TiTrash from "svelte-icons/ti/TiTrash.svelte";
  import CollectionMembersAddition from "./CollectionMembersAddition.svelte";
  import { page as pageStore } from "$app/stores";
  import { session } from "$app/stores";
  import type { ObjectListPage } from "@crkn-rcdr/access-data";
  import DynamicDragAndDropList from "../shared/DynamicDragAndDropList.svelte";
  import DynamicDragAndDropListItem from "../shared/DynamicDragAndDropListItem.svelte";
  import { showConfirmation } from "$lib/utils/confirmation";
  import Loading from "../shared/Loading.svelte";
  import Paginator from "../shared/Paginator.svelte";

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

  let positions: number[] = [];

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
  let page: number = 1;
  let size: number = 100;

  let previousLastItem: string | null = null;

  let loading: boolean = false;

  let list: HTMLElement;

  function setPositions() {
    positions = [];
    for (let i = 0; i < members.length; i++)
      positions.push((page - 1) * size + i + 1);
  }

  function changeView(newState: string) {
    state = newState;
  }

  async function getMemberContext(
    newMembers: { id?: string; label?: Record<string, string> }[]
  ) {
    loading = true;
    let currentMembers = newMembers.map((members) => members.id);

    const resolutions = await $session.lapin.query(
      "collection.viewMembersContext",
      currentMembers
    );

    documentSlug = resolutions.map((slug) => {
      return { id: slug[0], result: slug[1].result };
    });

    loading = false;
  }
  function setActiveIndex(index: number) {
    if (index >= collection?.members?.count)
      index = collection.members.count - 1;
    if (index < 0) index = 0;
    activeMemberIndex = index;
    dispatch("membersClicked", { index });
  }

  async function moveMemberOnInputChange(
    event: any,
    originalItemIndex: number
  ) {
    if (loading) return;
    loading = true;

    let pagedDestinationIndex = parseInt(event.detail.value) - 1;

    if (pagedDestinationIndex >= 0 && pagedDestinationIndex < childrenCount) {
      const canvasToMove = members[originalItemIndex];

      await sendMoveRequest(canvasToMove, pagedDestinationIndex);

      // Highlight and move to new position
      if (pagedDestinationIndex < members.length) {
        activeMemberIndex = pagedDestinationIndex;
        //jumpTo(activeCanvasIndex);
        setActiveIndex(activeMemberIndex);
      }
    }

    loading = false;
  }

  async function deleteMemberByIndex(event: any, index: number) {
    event.stopPropagation();

    if (index >= 0 && index < members.length) {
      const data = {
        id: collection.id,
        members: [members[index].id],
        user: $session.user,
      };

      // Shows a notification on move failure
      await showConfirmation(
        async () => {
          try {
            const response = await $session.lapin.mutation(
              "collection.removeMembers",
              data
            );
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
        "Error: failed to delete member.",
        true
      );

      // Shows a notification on page grab failure
      await showConfirmation(
        async () => {
          try {
            // we can just grab the current page again instead, but we need to store the previous page's last item to do so.
            await sendCurrentPageRequest();
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
    }
  }

  async function handlePage(event: { detail: { page: number } }) {
    if (loading) return;
    loading = true;

    page = event.detail.page;

    const currUrl = `${window.location}`;
    const newUrl = currUrl.includes("page")
      ? currUrl.replace(/\?page\=.*/, `?page=${page}`)
      : `${currUrl}?page=${page}`;
    history.pushState({}, null, newUrl);

    const currPage = await $session.lapin.query("collection.page", {
      id: collection.id,
      page: page,
      limit: size,
    });
    members = currPage.list;
    console.log("members", members);
    await getMemberContext(members);
    loading = false;
  }

  async function sendMoveRequest(memberToMove, pagedDestinationIndex) {
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
          await sendCurrentPageRequest();
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
        (page - 1) * size + event.detail.destinationItemIndex;

      const memberToMove = members[event.detail.currentItemIndex];

      sendMoveRequest(memberToMove, pagedDestinationIndex);

      if (pagedDestinationIndex < members.length) {
        activeMemberIndex = pagedDestinationIndex;
        //jumpTo(activeCanvasIndex);
        setActiveIndex(pagedDestinationIndex);
      }
    } else {
      console.log("invalid index");
    }

    loading = false;
  }

  async function sendCurrentPageRequest() {
    const currPage = await $session.lapin.query("collection.pageAfter", {
      id: collection.id,
      after: previousLastItem,
      limit: size,
    });
    //previousLastItem = members[members.length - 1].id;
    members = currPage.list;
    await getMemberContext(currPage.list);
    setActiveIndex(activeMemberIndex);
  }

  async function handleAddPressed(event: {
    detail: {
      selectedMembers: string[];
    };
  }) {
    const response = await $session.lapin.mutation("collection.addMembers", {
      id: collection.id,
      members: event.detail.selectedMembers,
      user: $session.user,
    });

    console.log(response);

    await sendCurrentPageRequest();

    const objectResponse = await $session.lapin.query(
      "accessObject.getPaged",
      collection.id
    );
    childrenCount = objectResponse.members.count;
    collection = objectResponse;

    state = "view";
  }

  onMount(async () => {
    activeMemberIndex = 0;
    if ($pageStore.query.get("page")) {
      page = parseInt($pageStore.query.get("page"));
      handlePage({ detail: { page } });
    } else {
      console.log("firstPage", firstPage);
      members = firstPage.list;
      getMemberContext(firstPage.list);
    }
  });

  $: {
    members;
    setPositions();
  }
</script>

{#if collection}
  <CollectionMembersAddition
    showAddButton={state != "add"}
    bind:destinationMember={collection}
    bind:contextDisplay={documentSlug}
    on:done={handleAddPressed}
    on:addClicked={() => {
      changeView("add");
      collection = collection;
      console.log("collection", collection);
    }}
  />

  <!-- I commented out the above and added the styling from the example to help me see what's going on.
    -->

  <div class="member-wrap" class:disabled={loading}>
    <!-- loop through the array where items are added when scrolling -->

    {#if collection.behavior !== "unordered"}
      <DynamicDragAndDropList
        bind:container={list}
        on:itemDropped={handleItemDropped}
      >
        <!--{collectionmembers.id}
              -->
        {#each members as collectionMember, i}
          <DynamicDragAndDropListItem pos={i + 1}>
            <div
              class="member"
              class:active={i === activeMemberIndex}
              on:mousedown={() => setActiveIndex(i)}
            >
              <div class="member-inner auto-align">
                <div class="actions-wrap">
                  <div class="auto-align auto-align__column">
                    <div class="action pos">
                      {positions[i]}
                    </div>
                    <div
                      class="action pos-input"
                      on:click={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <AutomaticResizeNumberInput
                        name="position"
                        max={childrenCount}
                        value={positions[i]}
                        on:changed={(e) => {
                          moveMemberOnInputChange(e, positions[i] - 1);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div class="auto-align auto-align__column label">
                  {#each documentSlug as document}
                    {#if document["result"]?.["label"]?.["none"] && document["id"] === collectionMember?.id}
                      <a
                        href="/object/edit/{collectionMember?.id}"
                        target="_blank"
                      >
                        {document["result"]["slug"]} : {document["result"][
                          "label"
                        ]["none"]}
                      </a>
                    {/if}
                  {/each}
                </div>
                <div class="actions-wrap">
                  <div class="auto-align auto-align__column">
                    <div
                      class="action icon"
                      data-tooltip="Remove from collection"
                      data-tooltip-flow="bottom"
                      on:click={(e) => deleteMemberByIndex(e, i)}
                    >
                      <TiTrash />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DynamicDragAndDropListItem>
        {/each}
      </DynamicDragAndDropList>
    {:else}
      <div bind:this={list}>
        {#each members as collectionMember, i}
          <div
            class="member"
            class:active={i === activeMemberIndex}
            on:mousedown={() => setActiveIndex(i)}
          >
            <div class="member-inner auto-align">
              <div class="auto-align auto-align__column label">
                {#each documentSlug as document}
                  {#if document["result"]?.["label"]?.["none"] && document["id"] === collectionMember?.id}
                    <a
                      href="/object/edit/{collectionMember?.id}"
                      target="_blank"
                    >
                      {document["result"]["slug"]} : {document["result"][
                        "label"
                      ]["none"]}
                    </a>
                  {/if}
                {/each}
              </div>
              <div class="actions-wrap">
                <div class="auto-align auto-align__column">
                  <div
                    class="action icon"
                    data-tooltip="Remove from collection"
                    data-tooltip-flow="bottom"
                    on:click={(e) => deleteMemberByIndex(e, i)}
                  >
                    <TiTrash />
                  </div>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
  <div class="pagination-wrap auto-align auto-align__a-start">
    {#if loading}
      <span class="page-info-loader">
        <Loading size="md" backgroundType="gradient" />
      </span>
    {/if}
    <Paginator
      {page}
      bind:pageSize={size}
      count={childrenCount}
      pageSizeEditable={false}
      on:change={handlePage}
    />
  </div>
{/if}

<style>
  .action {
    margin-right: var(--margin-sm);
  }
  .action.icon {
    opacity: 0.6;
    cursor: pointer;
  }
  .pos {
    font-weight: 400;
    margin-bottom: 0.56rem;
    margin-left: 0.56rem;
    min-width: 3.15rem;
  }
  .action.icon {
    display: none;
    margin-bottom: 0.5em;
  }
  .member {
    padding: 1rem 0;
  }
  .member:hover .action.icon {
    display: inherit;
  }
  .member-inner {
    width: 100%;
    background: var(--base-bg);
    padding: var(--perfect-fourth-2);
    border-radius: var(--border-radius);
  }
  .pos-input {
    display: none;
  }
  .member:hover .pos-input {
    display: inherit;
  }
  .member:hover .pos {
    display: none;
  }

  .member-wrap {
    display: flex;
    flex-direction: column;
    border-radius: 2px;
    width: 100%;
    max-width: 100%;
    max-height: 38rem;
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

  .member {
    padding: 1rem;
    min-height: 7rem;
  }

  .member:hover {
    background-color: #eeeeee;
  }
  .page-info-loader {
    margin-right: var(--margin-sm);
  }
  .pagination-wrap {
    float: right;
  }
  /*.active {
    background-color: white;
  }*/
  .label {
    flex: 9;
  }
</style>
