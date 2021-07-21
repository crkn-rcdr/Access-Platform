<script lang="ts">
  import { TiArrowRight } from "svelte-icons/ti/TiArrowRight.svelte";
  /* import { onMount } from "svelte";
  import IoMdOpen from "svelte-icons/io/IoMdOpen.svelte";*/
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";

  import CollectionEditor from "../collection/CollectionEditor.svelte";
  /*  import Switch from "$lib/components/shared//Switch.svelte";
  import SwitchCase from "$lib/components/shared//SwitchCase.svelte";
 */
  export let collection: Collection;
  console.log("collection in contetent", collection.members);
  let state = "view";
  let activeMembers: {} = Object.values(collection.members);

  function selectMember(index: number) {
    activeMembers = collection?.members?.[index] || null;
    triggerUpdate();
  }
  function changeView(newState: string) {
    state = newState;
  }
  function triggerUpdate() {
    collection.members = collection.members;
  }
</script>

{#if collection}
  <div class="auto-align auto-align__full">
    <div class="list-wrapper">
      <CollectionEditor
        showAddButton={state != "add"}
        bind:members={collection.members}
        on:membersClicked={(e) => {
          selectMember(e.detail.index);
        }}
        on:addClicked={() => {
          changeView("add");
        }}
      />
    </div>
  </div>
{/if}
