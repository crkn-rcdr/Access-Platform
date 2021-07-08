<script lang="ts">
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import TiArrowRight from "svelte-icons/ti/TiArrowRight.svelte";
  import type { AccessObject } from "@crkn-rcdr/access-data";
  import { isManifest, isCollection } from "@crkn-rcdr/access-data";
  import TypeAhead from "$lib/components/access-objects/TypeAhead.svelte";
  import { createEventDispatcher } from "svelte";
  import type {
    Manifest,
    Canvas,
  } from "@crkn-rcdr/access-data/src/access/Manifest";
  import ManifestCanvasSelector from "./ManifestCanvasSelector.svelte";
  export let destinationManifest: Manifest;
  export let destinationIndex: number = 0;

  const dispatch = createEventDispatcher();

  let selectedManifest: Manifest;
  let selectedCanvases: Canvas[] = [];
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

  function handleAddPressed() {
    destinationManifest?.canvases?.splice(
      destinationIndex,
      0,
      ...selectedCanvases
    );
    destinationManifest = destinationManifest;
    dispatch("done");
  }
</script>

<div class="canvas-selector-wrap">
  <div class="add-menu-title">
    <div class="auto-align auto-align__a-center">
      <h6>Add canvases from other manifests</h6>
      <button class="danger cancel-button" on:click={handleCancelPressed}>
        Exit
      </button>
    </div>
  </div>
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
    <ManifestCanvasSelector
      bind:manifest={selectedManifest}
      bind:selectedCanvases
    >
      <div class="auto-align auto-align__a-center" slot="title">
        <div class="title-wrap">
          <div class="auto-align auto-align__a-center">
            <div
              class="back-button"
              on:click={() => {
                error = "";
                showManifest = false;
              }}
            >
              <TiArrowBack />
            </div>
            <h6>
              {selectedManifest["slug"]}: {selectedManifest["label"]["none"]}
            </h6>
          </div>
        </div>
        <div class="action-buttons">
          <button
            class="primary"
            class:opacity-hidden={selectedCanvases.length ? false : true}
            on:click={handleAddPressed}
          >
            Add Canvas{selectedCanvases.length > 1 ? "es" : ""}
          </button>
        </div>
      </div>
    </ManifestCanvasSelector>
  {/if}
</div>

<style>
  .canvas-selector-wrap {
    position: relative;
    height: calc(100% - 121px);
    padding: 1.5rem 3rem;
  }
  .add-menu-title {
    width: 100%;
  }
  h6 {
    flex: 9;
    margin: 0 !important;
  }
  .title-wrap {
    flex: 9;
  }
</style>
