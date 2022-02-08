<script context="module" lang="ts">
</script>

<script lang="ts">
  import ManifestSelector from "$lib/components/manifests/ManifestSelector.svelte";
  import Wizard from "$lib/components/shared/Wizard.svelte";

  let selectedManifests: any[] = [];
  let batchName = "";

  function handleManifestSelectionChange(event: any) {
    selectedManifests = event.detail;
  }
</script>

<Wizard title="Create OCR Batch">
  <label>
    <h6>Enter an Identifiable Batch Name</h6>
    <input bind:value={batchName} />
  </label>
  <br />
  <br />

  <h6>Search for Canvases by Manifest</h6>
  <div class="auto-align canvas-select">
    <ManifestSelector on:change={handleManifestSelectionChange} />
  </div>

  <div class="wizard-buttons">
    <button class="secondary">Cancel</button>
    <button
      class="save"
      disabled={!selectedManifests?.length || !batchName.length}
    >
      Create OCR Batch
    </button>
  </div>
</Wizard>

<style>
  .canvas-select,
  input {
    width: 100%;
  }
  .search-box {
    flex: 5;
    margin-right: 1rem;
  }
  .search-results {
    flex: 7;
  }
  .wizard-buttons {
    position: absolute;
    bottom: var(--perfect-fourth-4);
    right: var(--perfect-fourth-4);
    z-index: 1;
    height: fit-content;
  }
  .results-table {
    height: 26rem;
    overflow-y: auto;
  }
</style>
