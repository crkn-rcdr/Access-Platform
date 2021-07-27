<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*

**Example two**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import type { ObjectList } from "@crkn-rcdr/access-data";
  import { onMount, createEventDispatcher } from "svelte";

  /**
   * @type {string} Slug being resolved.
   */
  export let canvases: ObjectList;

  /**
   * @type {string} Slug being resolved.
   */
  export let selectedCanvases: ObjectList = [];

  /**
   * @type {string} Slug being resolved.
   */
  export let options: any = {};

  /**
   * @type {string} Slug being resolved.
   */
  export let multiple =
    true; /* We could edit this to give a max number of items selectable */

  /**
   * @type {string} Slug being resolved.
   */
  export let selectAll = false;

  /**
   * @type {string} Slug being resolved.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {string} Slug being resolved.
   */
  let OpenSeadragon: any;

  /**
   * @type {string} Slug being resolved.
   */
  let container: HTMLDivElement;

  /**
   * @type {string} Slug being resolved.
   */
  let imageURLs: string[] = [];

  /**
   * @type {string} Slug being resolved.
   */
  let inputs: any[] = [];

  /**
   * @type {string} Slug being resolved.
   */
  let maxSelected = false;

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function clearSelectedCanvasList() {
    selectedCanvases = [];
    clearSelected();
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function addAllToCanvasList() {
    if (canvases) {
      selectedCanvases = canvases;
      setAllSelected();
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function selectInputsFromSelectedCanvasList() {
    let indexesToSelect: number[] = [];
    let index = 0;
    for (const canvas of canvases) {
      for (const selectedCanvas of selectedCanvases) {
        if (canvas["id"] === selectedCanvas["id"]) indexesToSelect.push(index);
      }
      index++;
    }

    for (const index of indexesToSelect) {
      inputs[index].checked = true;
    }
    checkMaxSelected();
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function clearSelected() {
    for (const input of inputs) {
      input.checked = false;
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function setAllSelected() {
    for (const input of inputs) {
      input.checked = true;
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function checkMaxSelected() {
    if (!multiple && selectedCanvases.length) {
      maxSelected = true;
    } else {
      maxSelected = false;
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function handleSelection(input: any, canvas: any) {
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

    checkMaxSelected();

    dispatch("selected", canvas);
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function clearViewer() {
    if (container) {
      container.innerHTML = "";
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
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
      addInputCheckboxesToOpenseadragon();
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function addInputCheckboxesToOpenseadragon() {
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
              handleSelection(input, canvases[index]);
            });
            inputs.push(input);
            label.appendChild(input);
            navDiv.appendChild(label);
          }
        }
      }
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  onMount(async () => {
    OpenSeadragon = await import("openseadragon");
    await drawImage();
    selectInputsFromSelectedCanvasList();
  });

  // Update inputs on select all/deselect all
  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  $: {
    if (selectAll) addAllToCanvasList();
    else clearSelectedCanvasList();
  }
</script>

<div class="canvases-viewer" bind:this={container} />

<style>
  .canvases-viewer {
    width: 100%;
    height: 100%;
  }

  /*.selected-canvas-list {
    flex: 9;
    text-align: right;
  }*/

  :global(div[title="Zoom in"] img),
  :global(div[title="Zoom out"] img),
  :global(div[title="Go home"] img),
  :global(div[title="Toggle full page"] img) {
    cursor: pointer;
    opacity: 0.5;
  }

  :global(div[title="Zoom in"]),
  :global(div[title="Zoom out"]),
  :global(div[title="Go home"]),
  :global(div[title="Toggle full page"]) {
    margin-left: 0.25rem !important;
  }

  :global(.referencestrip) {
    margin-left: 0 !important;
    min-width: 12vw;
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
