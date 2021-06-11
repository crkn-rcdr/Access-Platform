<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import CanvasManifestCanvasSelectorGrid from "./CanvasManifestCanvasSelectorGrid.svelte";
  import Align from "../shared/Align.svelte";
  import CanvasManifestSearch from "./CanvasManifestSearch.svelte";
  import CanvasManifestTable from "./CanvasManifestTable.svelte";
  import Switch from "../shared/Switch.svelte";
  import SwitchCase from "../shared/SwitchCase.svelte";
  import SwitchDefault from "../shared/SwitchDefault.svelte";

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
    <Align>
      <CanvasManifestSearch bind:results={manifestSearchResults} />
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
        <CanvasManifestTable
          title="Search Results"
          bind:manifests={manifestSearchResults}
          on:rowClicked={handleManifestTableClick}
        />
      </SwitchDefault>
    </Switch>
  {/if}

  {#if showManifest}
    <CanvasManifestCanvasSelectorGrid
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
