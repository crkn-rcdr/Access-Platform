<script lang="ts">
  import Align from "../shared/Align.svelte";
</script>

<div class="canvas-selector-wrap">
  <Align>
    <input
      class="search"
      placeholder="Search for a manifest to add canvases from..."
    />

    <div class="action-buttons">
      <button class="primary">Add Canvas(es)</button>
      <button class="secondary">Cancel</button>
    </div>
  </Align>

  <div class="results">
    <img
      src="https://image-uvic.canadiana.ca/iiif/2/69429%2Fc08s4jp15g01/full/!220,292/0/default.jpg"
    />

    <img
      src="https://image-uvic.canadiana.ca/iiif/2/69429%2Fc0513tw3hp7p/full/!220,292/0/default.jpg"
    />

    <img
      src="https://image-uvic.canadiana.ca/iiif/2/69429%2Fc0183435vx78/full/!220,292/0/default.jpg"
    />

    <img
      src="https://image-uvic.canadiana.ca/iiif/2/69429%2Fc0wh2d987m77/full/!220,292/0/default.jpg"
    />

    <img
      src="https://image-uvic.canadiana.ca/iiif/2/69429%2Fc0rr1pj0kv4w/full/!220,292/0/default.jpg"
    />

    <img
      src="https://image-uvic.canadiana.ca/iiif/2/69429%2Fc0n00zr2z33x/full/!220,292/0/default.jpg"
    />

    <img
      src="https://image-uvic.canadiana.ca/iiif/2/69429%2Fc0h98zb84g4k/full/!220,292/0/default.jpg"
    />

    <img
      src="https://image-uvic.canadiana.ca/iiif/2/69429%2Fc0cj87k0gq3s/full/!220,292/0/default.jpg"
    />
  </div>
</div>

<style>
  .canvas-selector-wrap {
    padding: 2em;
    position: relative;
  }

  .search {
    flex: 9;
    margin-right: 16px;
    margin-top: 0;
  }

  .results {
    overflow-y: auto;
    height: 83vh;
    background: black;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  @media (max-height: 900px) {
    .results {
      height: 300px;
    }
  }

  img {
    height: max(18vh, 361px);
    width: max(13vh, 280px);
    display: inline !important;
    margin: 46px;
    border: none;
  }
</style>
