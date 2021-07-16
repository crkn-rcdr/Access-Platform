<script lang="ts">
  import { onMount } from "svelte";
  import IoMdOpen from "svelte-icons/io/IoMdOpen.svelte";
  import type { Collection } from "@crkn-rcdr/access-data/src/access/Collection";

  import CollectionEditor from "../collection/CollectionEditor.svelte";
  import Switch from "$lib/components/shared//Switch.svelte";
  import SwitchCase from "$lib/components/shared//SwitchCase.svelte";

  export let collection: Collection;
  console.log("collection in contetent", collection.members);
  let state = "view";
let activeMembers: collection.members | null
  function changeView(newState: string) {
    state = newState;
  }
</script>

{#if collection}
  <div class="auto-align auto-align__full">
    <div class="list-wrapper">
      <CollectionEditor
        showAddButton={state != "add"}
        bind:value={collection["members"]}
        on:addClicked={() => {
          changeView("add");
        }}
      />
    </div>
    <!-- <div class="state-wrap">
      <Switch bind:checkVal={state}>
        <SwitchCase caseVal="view">
          <div class="auto-align auto-align__full">
            <div class="view-wrap">
              {#if activeCanvas}
                <CanvasViewer canvas={activeCanvas} />
              {/if}
            </div>
            <div class="label-wrap">
              {#if activeCanvas}
                <CanvasLabelEditor
                  bind:label={activeCanvas["label"]["none"]}
                  on:changed={triggerUpdate}
                > -->
    <!--Todo, own component-->
    <!--a class="takedown" href="/takedown" target="_blank">
                    <div
                      class="auto-align auto-align__full auto-align auto-align__a-center"
                    >
                      <div class="message">
                        Take this canvas off of the platform
                      </div>
                      <div class="icon">
                        <IoMdOpen />
                      </div>
                    </div>
                  </a-->
    <!--  </CanvasLabelEditor>
              {/if}
            </div>
          </div>
        </SwitchCase>
        <SwitchCase caseVal="add"> -->
    <!--TODO: Should we add the canvases after the selected canvas or just at the begining or end of the manifest?-->
    <!--  <ManifestAddCanvasMenu
            bind:destinationManifest={manifest}
            on:done={() => {
              state = "view";
              setActiveCanvas(0);
            }}
          />
        </SwitchCase>
      </Switch> -->
    <!-- </div> -->
  </div>
{/if}
