<script lang="ts">
  import TiArrowRight from "svelte-icons/ti/TiArrowRight.svelte";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import { createEventDispatcher } from "svelte";
  import type { Manifest } from "@crkn-rcdr/access-data/src/access/Manifest";
  import ManifestCanvasSelectorGrid from "./ManifestCanvasSelectorGrid.svelte";
  export let destinationManifest: Manifest;
  export let destinationIndex: number = 0;

  const dispatch = createEventDispatcher();

  let selectedManifest: Manifest;
  let showManifest = false;
  let error = "";

  async function handleSelect(event: any) {
    let noid = event.detail;
    const response = await fetch(`/object/${noid}.json`);
    const json = await response.json();
    if (response.ok) {
      const object = json.object as AccessObject;
      if (isCollection(object)) {
        error = "Error: Object is a collection, please select another.";
      } else if (isManifest(object)) {
        selectedManifest = object;
      }
    } else {
      error = json.error;
    }
    showManifest = true;
  }

  function handleCancelPressed() {
    dispatch("done");
  }

  function handleAddPressed(event: any) {
    destinationManifest?.canvases?.splice(
      destinationIndex,
      0,
      ...event.detail.selectedCanvases
    );
    destinationManifest = destinationManifest;
    dispatch("done");
  }
</script>

<div class="canvas-selector-wrap">
  <button class="danger cancel-button" on:click={handleCancelPressed}>
    Exit
  </button>
  <br />
  <br />
  <br />

  {#if error}
    <div class="alert alert-danger">
      {error}
    </div>
  {/if}

  <div>
    <!--Todo: ask how best to limit to only manifests-->
    <TypeAhead
      label=""
      placeholder="Search for a manifest..."
      on:selected={handleSelect}
      on:keypress={() => (error = "")}
    >
      View and select canvases
      <div class="icon"><TiArrowRight /></div>
    </TypeAhead>
  </div>

  {#if showManifest}
    <ManifestCanvasSelectorGrid
      bind:manifest={selectedManifest}
      on:backPressed={() => {
        error = "";
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
    background: var(--dark-gradient);
    color: var(--light-font);
  }
  .cancel-button {
    float: right;
  }
</style>
