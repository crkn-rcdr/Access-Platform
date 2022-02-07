<script context="module" lang="ts">
</script>

<script lang="ts">
  import ManifestSelector from "$lib/components/manifests/ManifestSelector.svelte";
  import Wizard from "$lib/components/shared/Wizard.svelte";
</script>

<Wizard title="Create OCR Batch">
  <label>
    <h6>Enter an Identifiable Batch Name</h6>
    <input />
  </label>
  <br />
  <br />

  <h6>Search for Canvases by Manifest</h6>
  <div class="auto-align canvas-select">
    <!--div class="auto-align auto-align__column auto-align__a-end search-box">
      <PrefixSlugSearchBox rows={9} />
      <button class="primary">Search</button>
    </div>

    <div class="search-results">
      8/10 selected

      <div class="results-table">
        <table>
          <thead>
            <th>Select</th>
            <th>Slug</th>
            <th>Label</th>
            <th># Canvases</th>
          </thead>
          <tbody>
            <tr>
              <td>Select</td>
              <td>Slug</td>
              <td>Label</td>
              <td># Canvases</td>
            </tr>
            <tr>
              <td>Select</td>
              <td>Slug</td>
              <td>Label</td>
              <td># Canvases</td>
            </tr>
            <tr>
              <td>Select</td>
              <td>Slug</td>
              <td>Label</td>
              <td># Canvases</td>
            </tr>
            <tr>
              <td>Select</td>
              <td>Slug</td>
              <td>Label</td>
              <td># Canvases</td>
            </tr>
            <tr>
              <td>Select</td>
              <td>Slug</td>
              <td>Label</td>
              <td># Canvases</td>
            </tr>
            <tr>
              <td>Select</td>
              <td>Slug</td>
              <td>Label</td>
              <td># Canvases</td>
            </tr>
            <tr>
              <td>Select</td>
              <td>Slug</td>
              <td>Label</td>
              <td># Canvases</td>
            </tr>
            <tr><td colspan="4">Error ---</td></tr>
          </tbody>
        </table>
      </div>
    </div-->
    <ManifestSelector />
  </div>

  <div class="wizard-buttons">
    <button class="secondary">Cancel</button>
    <button class="save">Create OCR Batch</button>
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
