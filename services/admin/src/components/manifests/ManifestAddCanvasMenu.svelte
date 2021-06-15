<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import ManifestCanvasSelectorGrid from "./ManifestCanvasSelectorGrid.svelte";
  import Align from "../shared/Align.svelte";
  import Switch from "../shared/Switch.svelte";
  import SwitchCase from "../shared/SwitchCase.svelte";
  import SwitchDefault from "../shared/SwitchDefault.svelte";
  import ManifestSearch from "../temporary/ManifestSearch.svelte";
  import ManifestTable from "../temporary/ManifestTable.svelte";

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
  <div>
    <!-- TODO: replace with slug resolver component-->
    <Align>
      <ManifestSearch bind:results={manifestSearchResults} />
      <button class="secondary cancel-button" on:click={handleCancelPressed}
        >Cancel</button
      >
    </Align>
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
    padding: 2em;
    position: relative;
    height: 100%;
  }
  .cancel-button {
    margin-left: 4px;
  }
</style>
