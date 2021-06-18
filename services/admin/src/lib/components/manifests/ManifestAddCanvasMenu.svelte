<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import ManifestCanvasSelectorGrid from "./ManifestCanvasSelectorGrid.svelte";
  import Switch from "$lib/components/shared//Switch.svelte";
  import SwitchCase from "$lib/components/shared//SwitchCase.svelte";
  import SwitchDefault from "$lib/components/shared//SwitchDefault.svelte";
  import ManifestSearch from "$lib/components/temporary/ManifestSearch.svelte";
  import ManifestTable from "$lib/components/temporary/ManifestTable.svelte";

  export let destinationManifest: CanvasManifest;
  export let destinationIndex: number = 0;

  const dispatch = createEventDispatcher();

  let selectedManifest: CanvasManifest;
  let manifestSearchResults: CanvasManifest[];
  let showManifest: boolean = false;

  function handleManifestTableClick(event: any) {
    selectedManifest = event.detail.manifest;
    showManifest = true;
  }

  function handleCancelPressed() {
    manifestSearchResults = [];
    dispatch("done");
  }

  function handleAddPressed(event: any) {
    destinationManifest.canvases.splice(
      destinationIndex,
      0,
      ...event.detail.selectedCanvases
    );
    destinationManifest = destinationManifest;
    dispatch("done");
  }
</script>

<div class="canvas-selector-wrap">
  <!-- TODO: replace with slug resolver component-->
  <div>
    <div class="auto-align auto-align__a-center">
      <ManifestSearch bind:results={manifestSearchResults} />
      <button class="secondary cancel-button" on:click={handleCancelPressed}
        >Cancel</button
      >
    </div>
  </div>

  {#if manifestSearchResults}
    <Switch bind:checkVal={manifestSearchResults.length}>
      <SwitchCase caseVal={0}>
        <br />
        <p>No results.</p>
      </SwitchCase>
      <SwitchDefault>
        <ManifestTable
          title="Search Results"
          bind:manifests={manifestSearchResults}
          on:rowClicked={handleManifestTableClick}
        />
      </SwitchDefault>
    </Switch>
  {/if}

  {#if showManifest}
    <ManifestCanvasSelectorGrid
      bind:manifest={selectedManifest}
      on:backPressed={() => {
        showManifest = false;
      }}
      on:addPressed={handleAddPressed}
    />
  {/if}
</div>

<style>
  .canvas-selector-wrap {
    padding: 3.5rem 4rem;
    position: relative;
    height: 100%;
  }
  .cancel-button {
    margin-left: 0.25rem;
  }
</style>
