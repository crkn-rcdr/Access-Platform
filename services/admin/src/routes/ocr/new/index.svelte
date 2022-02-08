<script context="module" lang="ts">
</script>

<script lang="ts">
  import ManifestSelector from "$lib/components/manifests/ManifestSelector.svelte";
  import NotificationBar from "$lib/components/shared/NotificationBar.svelte";
  import Wizard from "$lib/components/shared/Wizard.svelte";
  import { Slug } from "@crkn-rcdr/access-data";

  let selectedManifests: any[] = [];
  let batchName = "";
  let validSlug = true;
  function handleManifestSelectionChange(event: any) {
    selectedManifests = event.detail;
  }

  $: validSlug = batchName.length ? Slug.safeParse(batchName).success : true;
</script>

<Wizard title="Create OCR Batch">
  <label>
    <h6>Enter an Identifiable Batch Name</h6>
    {#if !validSlug}
      <NotificationBar
        status="fail"
        message="Batch name can only contain letters, numbers, and the following symbols: _ - ."
      />
    {/if}
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
      disabled={!selectedManifests?.length || !batchName.length || !validSlug}
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
  .wizard-buttons {
    position: absolute;
    bottom: var(--perfect-fourth-4);
    right: var(--perfect-fourth-4);
    z-index: 1;
    height: fit-content;
    background: white;
    width: 100%;
    text-align: right;
  }
</style>
