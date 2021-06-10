<script lang="ts">
  import type { CanvasManifest } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/CanvasManifest";
  import TiArrowBack from "svelte-icons/ti/TiArrowBack.svelte";
  import TiEye from "svelte-icons/ti/TiEye.svelte";
  import TiEyeOutline from "svelte-icons/ti/TiEyeOutline.svelte";
  import Align from "../shared/Align.svelte";

  let selectedManifest: CanvasManifest | null;

  let results: CanvasManifest[] = [
    {
      id: "69429/m0696zw19t6s",
      _rev: "1-ea1f9f2304d194cd9b6f46e4f59d8d04",
      updateInternalmeta: {
        processDate: "2021-01-17T06:42:37Z",
        requestDate: "2021-01-13T20:00:34Z",
        message: "",
        succeeded: true,
      },
      dmdType: "issueinfo",
      from: "canvases",
      type: "manifest",
      canvases: [
        {
          id: "69429/c09s1kj9h004",
          label: {
            none: "Image 1",
          },
        },
        {
          id: "69429/c0610vs1v70v",
          label: {
            none: "Image 2",
          },
        },
        {
          id: "69429/c02805046f82",
          label: {
            none: "Image 3",
          },
        },
        {
          label: {
            none: "Image 4",
          },
          id: "69429/c0xg9f66k47d",
        },
        {
          id: "69429/c0sq8qd8xc3v",
          label: {
            none: "Image 5",
          },
        },
        {
          label: {
            none: "Image 6",
          },
          id: "69429/c0nz80n18k93",
        },
        {
          label: {
            none: "Image 7",
          },
          id: "69429/c0j678v3mt8m",
        },
        {
          id: "69429/c0dj58f8t71q",
          label: {
            none: "Image 8",
          },
        },
      ],
      public: "2020-08-30T00:52:39Z",
      slug: "oocihm.8_06941_1",
      label: {
        none: "Vol. I, No. 1 (October 17, 1891)",
      },
    },
  ];

  let selectedCanvases: Canvas[] = [];

  function setManifest(manifest: CanvasManifest) {
    selectedManifest = manifest;
  }

  function setSelectedCanvases(canvas: Canvas) {
    if (selectedCanvases.includes(canvas)) {
      selectedCanvases = selectedCanvases.filter((el) => canvas != el);
    } else {
      selectedCanvases.push(canvas);
    }
    selectedCanvases = selectedCanvases;
  }

  function previewCanvas(event: any) {
    event.stopPropagation();
  }
</script>

<div class="canvas-selector-wrap">
  <div>
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
  </div>

  <table>
    <thead>
      <tr>
        <th>Manifests</th>
      </tr>
    </thead>
    <tbody>
      {#each results as manifest}
        <tr on:click={() => setManifest(manifest)}>
          <td>Name</td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if selectedManifest}
    <div class="results">
      <h5>
        <Align vertical="center">
          <div class="back-button" on:click={() => (selectedManifest = null)}>
            <TiArrowBack />
          </div>
          oocihm.8_06941_2: Vol. I, No. 1 (October 17, 1891)
        </Align>
      </h5>

      <div class="canvas-tiles">
        {#each selectedManifest["canvases"] as canvas}
          <div
            class="canvas-tile"
            class:selected={selectedCanvases.includes(canvas)}
            on:click={() => setSelectedCanvases(canvas)}
          >
            <!--div class="canvas-tile-label">
              <Align vertical="center">
                <input type="checkbox" />
                <div class="canvas-tile-label-text clamp">
                  {canvas["label"]["none"]}
                </div>
              </Align>
            </div-->
            <img
              alt={canvas["label"]["none"]}
              src={`https://image-uvic.canadiana.ca/iiif/2/${encodeURIComponent(
                canvas["id"]
              )}/full/!425,524/0/default.jpg`}
            />

            <div class="canvas-tile-body">
              <Align>
                {#if selectedCanvases.includes(canvas)}
                  <input class="shadow" type="checkbox" checked />
                {/if}
                <div
                  on:click={previewCanvas}
                  class="canvas-preview-button shadow"
                >
                  <TiEye />
                </div>
              </Align>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .canvas-selector-wrap {
    padding: 2em;
    position: relative;
    height: 100%;
  }

  .search {
    flex: 9;
    margin-right: 16px;
    margin-top: 0;
  }

  h5 {
    color: var(--light-font);
    padding: 1em !important;
  }

  table {
    margin-top: 1em;
  }

  tbody tr {
    cursor: pointer;
  }

  tbody tr:hover {
    background-color: rgb(241, 241, 241);
  }
  /* Can be moved to sub component */

  .results {
    background: black;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .canvas-tiles {
    height: 70vh;
    overflow-y: auto;
  }

  @media (max-height: 900px) {
    .canvas-tiles {
      height: 300px;
    }
  }

  .back-button {
    width: 1.2em;
    height: 1.2em;
    margin-right: 1em;
    cursor: pointer;
    border-radius: 4px;
  }

  .back-button:hover {
    background-color: #111111;
  }

  .canvas-tile {
    display: inline-block;
    height: 564px;
    width: 425px;
    position: relative;
    margin: 2vh 2vw;
    color: white;
    cursor: pointer;
  }

  .canvas-tile:hover img {
    filter: brightness(1.1);
  }

  .canvas-tile img {
    position: absolute;
    top: 0; /*50px;*/
    bottom: 0;
    left: 0;
    right: 0;
  }
  .canvas-tile.selected img {
    filter: sepia() hue-rotate(140deg) brightness(0.8);
    border-radius: 4px;
    border: 2px solid var(--teal);
  }

  .canvas-tile-body {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    /*
    background: black;
    border-radius: 0 0 4px 0;*/
  }

  .canvas-preview-button {
    width: 2em;
    height: 2em;
    padding: 0 0 3px 0;
    color: var(--light-font);
    background-color: var(--grey);
    border-radius: 4px;
    margin: 3px 3px 3px 4px;
  }

  .canvas-preview-button:hover {
    background-color: #4e4e4e;
  }

  .canvas-tile.selected .canvas-preview-button {
    background: #699197;
  }
  @supports (-moz-appearance: none) {
    .canvas-tile.selected .canvas-preview-button {
      background: #7fabb4;
    }
  }

  .canvas-tile.selected .canvas-preview-button:hover {
    background: #597c81;
  }
  @supports (-moz-appearance: none) {
    .canvas-tile.selected .canvas-preview-button:hover {
      background: #699097;
    }
  }

  input[type="checkbox"] {
    width: 36px;
    height: 36px;
  }

  input[type="checkbox"]:checked {
    filter: sepia() hue-rotate(140deg) brightness(1.1) var(--shadow);
  }
  /*
  .canvas-tile img {
    position: absolute;
    top: 50px;
  }
  .canvas-tile-label {
    font-size: var(--smaller-font-size);
  }
  .canvas-tile-label-text {
    margin-left: 8px;
    width: 75%;
  }
  @supports (-moz-appearance: none) {
    .canvas-tile-label {
      font-weight: 600 !important;
    }
  }*/
</style>
