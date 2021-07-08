<script lang="ts">
  import { onMount, afterUpdate, createEventDispatcher } from "svelte";
  import type { Canvas } from "@crkn-rcdr/access-data/src/access/Manifest";

  export let canvases: Canvas[];
  export let selectedCanvases: Canvas[] = [];
  export let options: any = {};
  export let multiple = true;

  const dispatch = createEventDispatcher();

  let OpenSeadragon: any;
  let container: HTMLDivElement;
  let imageURLs: string[] = [];
  let inputs: any[] = [];
  let maxSelected = false;
  let selectAll = false;

  $: {
    if (selectAll) addAllToCanvasList();
    else clearSelectedCanvasList();
  }

  function clearSelectedCanvasList() {
    selectedCanvases = [];
    clearSelected();
  }
  function addAllToCanvasList() {
    if (canvases) {
      selectedCanvases = canvases;
      setAllSelected();
    }
  }

  function clearSelected() {
    for (const input of inputs) {
      input.checked = false;
    }
  }

  function setAllSelected() {
    for (const input of inputs) {
      input.checked = true;
    }
  }

  function handleSelection(input: any, canvas: Canvas) {
    if (maxSelected) {
      clearSelected();
      selectedCanvases = [canvas];
      input.checked = true;
    } else if (selectedCanvases.includes(canvas)) {
      selectedCanvases = selectedCanvases.filter((el) => el !== canvas);
      input.checked = false;
    } else {
      selectedCanvases.push(canvas);
      selectedCanvases = selectedCanvases;
      input.checked = true;
    }

    if (!multiple && selectedCanvases.length) {
      maxSelected = true;
    } else {
      maxSelected = false;
    }

    dispatch("selected", canvas);
  }

  function clearViewer() {
    if (container) {
      container.innerHTML = "";
    }
  }

  async function drawImage() {
    clearViewer();
    if (canvases && OpenSeadragon) {
      imageURLs = canvases.map(
        (canvas) =>
          `https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
            canvas["id"]
          )}/info.json`
      );
      OpenSeadragon.default({
        element: container,
        prefixUrl: "/openseadragon/images/", // for the icons the viewer uses
        tileSources: imageURLs,
        viewportMargins: {
          top: 0,
          bottom: 0,
        },
        immediateRender: true,
        ...options,
      });
      addSelectors();
    }
  }

  function addSelectors() {
    const refStrips = container.getElementsByClassName("referencestrip");
    if (refStrips && refStrips.length && refStrips[0]) {
      const refStrip: Element = refStrips[0];
      const refs = refStrip.children;
      for (const i in refs) {
        if (refs.hasOwnProperty(i)) {
          const navDiv = refs[i];
          if (navDiv) {
            const label = document.createElement("label");
            label.classList.add("ref-item-select");
            label.setAttribute("for", `checkbox-${i}`);
            const input = document.createElement("input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("name", `checkbox-${i}`);
            input.addEventListener("click", () => {
              const index = parseInt(i);
              handleSelection(input, <Canvas>canvases[index]);
            });
            inputs.push(input);
            label.appendChild(input);
            //label.innerHTML = label.innerHTML + "select";
            navDiv.appendChild(label);
          }
        }
      }
    }
  }

  onMount(async () => {
    OpenSeadragon = await import("openseadragon");
    await drawImage();
  });

  afterUpdate(async () => {
    /*let newImageUrl = `https://image-tor.canadiana.ca/iiif/2/${encodeURIComponent(
      canvas["id"]
    )}/info.json`;
    if (imageURL !== newImageUrl)
    await drawImage();*/
  });
</script>

{#if multiple}
  <div class="manifest-controls auto-align auto-align__a-center">
    <label class="auto-align auto-align__a-center">
      <input type="checkbox" bind:checked={selectAll} />
      {canvases.length === selectedCanvases.length
        ? "deselect all"
        : "select all"}
    </label>

    {#if selectedCanvases.length}
      <div class="selected-canvas-list">
        {selectedCanvases.length} canvas{selectedCanvases.length > 1
          ? "es"
          : ""} selected.
      </div>
    {/if}
  </div>
{/if}
<div class="canvases-viewer" bind:this={container} />

<style>
  .manifest-controls {
    width: 100%;
    height: fit-content;
    padding-top: 0.5rem;
    background: #333333;
    z-index: 1;
    color: var(--light-font);
    padding: 0.7rem;
  }

  .manifest-controls label {
    padding-bottom: 0;
  }

  .manifest-controls > * {
    margin-right: 1rem;
  }

  .canvases-viewer {
    width: 100%;
    height: 100%;
  }

  label {
    width: fit-content;
    height: fit-content;
  }

  .selected-canvas-list {
    flex: 9;
    text-align: right;
  }

  :global(div[title="Zoom in"] img, div[title="Zoom out"]
      img, div[title="Go home"] img, div[title="Toggle full page"] img) {
    cursor: pointer;
    opacity: 0.5;
  }

  :global(div[title="Zoom in"], div[title="Zoom out"], div[title="Go home"], div[title="Toggle full page"]) {
    margin-left: 0.25rem !important;
  }

  :global(.referencestrip) {
    margin-left: 0 !important;
  }

  :global(.referencestrip > *) {
    width: 100% !important;
    position: relative !important;
  }

  :global(.referencestrip > * > *) {
    width: 100% !important;
  }

  :global(.displayregion) {
    z-index: 1 !important;
  }

  :global(.ref-item-select) {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    cursor: pointer;
    padding: 0.5rem;
    /*background: #131313cc;
    color: white;
    border-top: 1px solid var(--grey);*/
  }

  :global(.ref-item-select input[type="checkbox"]) {
    width: 2rem;
    height: 2rem;
  }
</style>
