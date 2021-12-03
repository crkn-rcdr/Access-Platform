<!--
@component
### Overview
This component shows the canvases belonging to a list of canvases in a viewer/selector built from OpenSeadragon.

### Properties
|    |    |    |
| -- | -- | -- |
| canvases: ObjectList          | required | The canvases to be displayed for selection. |
| selectedCanvases: ObjectList  | optional | The canvases that are selected. |
| options: any                  | optional | The openseadragon viewer options, @see https://openseadragon.github.io/docs/OpenSeadragon.html#.Options) for more oopenseadragon options. |
| multiple: boolean             | optional | If the user can only select a single canvas, or multiple. |
| selectAll: boolean            | optional | If the user wants to  selected all of the canvases.  |

### Usage
```  
<CanvasesSelector
    bind:selectedCanvases
    bind:multiple
    bind:selectAll
    canvases={selectedManifest["canvases"]}
    options={{
      showNavigator: true,
      sequenceMode: true,
      showReferenceStrip: true,
      showHomeControl: false,
      showZoomControl: false,
      showFullPageControl: false,
      showSequenceControl: false,
      referenceStripScroll: "vertical",
      autoHideControls: false,
      homeFillsViewer: true,
    }}
  />
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*

*Note: See [OpenSeadragon Docs](https://openseadragon.github.io/docs/OpenSeadragon.html#.Options) for more oopenseadragon options.*
-->
<script lang="ts">
  import { onMount, createEventDispatcher } from "svelte";

  /**
   * @type {ObjectList} The canvases to be displayed for selection.
   */
  export let canvases: { id?: string; label?: Record<string, string> }[];

  /**
   * @type {{ id?: string; label?: Record<string, string>; }[]} The canvases that are selected.
   */
  export let selectedCanvases: {
    id?: string;
    label?: Record<string, string>;
  }[] = [];

  /**
   * @type {any} The openseadragon viewer options, @see https://openseadragon.github.io/docs/OpenSeadragon.html#.Options) for more oopenseadragon options.
   */
  export let options: any = {};

  /**
   * @type {boolean} If the user can only select a single canvas, or multiple.
   */
  export let multiple =
    true; /* We could edit this to give a max number of items selectable */

  /**
   * @type {boolean} If the user wants to  selected all of the canvases.
   */
  export let selectAll = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {any} The OpenSeadragon module.
   */
  let OpenSeadragon: any;

  /**
   * @type {HTMLDivElement} The html element to attach the openseadragon viewer to.
   */
  let container: HTMLDivElement;

  /**
   * @type {string} The image api string urls for the canvases.
   */
  let imageURLs: string[] = [];

  /**
   * @type {any[]} The array of html input checkboxes corresponding to each canvas.
   */
  let inputs: any[] = [];

  /**
   * @type {boolean} If the maximum number of canvases has been selected or not.
   */
  let maxSelected = false;

  /**
   * This function empties the selected canvases list, and calls @function clearSelected which clears the inputs for the selected canvases.
   * @returns void
   */
  function clearSelectedCanvasList() {
    selectedCanvases = [];
    clearSelected();
  }

  /**
   * This method sets the selected canvases list to the complete list of canvases, then calls @function setAllSelected which sets all of their input elements to be selected
   * @returns void
   */
  function addAllToCanvasList() {
    if (canvases) {
      selectedCanvases = canvases;
      setAllSelected();
    }
  }

  /**
   * Selects the checkbox input elements for the canvases belonging to the selected canvas list. Calls @function checkMaxSelected to see if selecting should be disabled or not.
   * @param arr
   * @returns void
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
   * Clears the inputs for the selected canvases
   * @returns void
   */
  function clearSelected() {
    for (const input of inputs) {
      input.checked = false;
    }
  }

  /**
   * Sets all of input elements to be selected
   * @returns void
   */
  function setAllSelected() {
    for (const input of inputs) {
      input.checked = true;
    }
  }

  /**
   * Checks to see if selecting should be disabled or not
   * @returns void
   */
  function checkMaxSelected() {
    if (!multiple && selectedCanvases.length) {
      maxSelected = true;
    } else {
      maxSelected = false;
    }
  }

  /**
   * Handles the clicking of canvas checkbox inputs.
   * If the maximum amount of canvases are selected, every other canvases is removed and the canvas that had its input clicked is added to the selected canvases.
   * If the canvas is already selected, it is removed from the selected canvases list
   * If the canvas isn't selected, it is added to the selected canvases list.
   * After the appropriate action is taken, @function checkMaxSelected
   * The method triggers a @event selected which outputs the canvas that was selected in its event.detail.
   * @param input
   * @param canvas
   * @returns void
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
   * Clears the element containing the openseadragon canvas viewer
   * @returns void
   */
  function clearViewer() {
    if (container) {
      container.innerHTML = "";
    }
  }

  /**
   * Calls @function clearViewer to remove any old instantiations of the openseadragon viewer, then uses the options passed into this component to create a new openseadragon viewer, and attach it to the container. It then calls @function addInputCheckboxesToOpenseadragon to augment it with input checkbox per canvas, that can be used to select canvases.
   * @returns void
   */
  async function drawImages() {
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
   * Augments the openseadragon images viewer thumbnail list with inputs of type checkbox that the user can press to select canvases.
   * @returns void
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
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var OpenSeadragon is instantiated, the canvases are drawn by calling @function drawImages(), then the appropriate canvases are selected by calling @function selectInputsFromSelectedCanvasList
   */
  onMount(async () => {
    OpenSeadragon = await import("openseadragon");
    await drawImages();
    selectInputsFromSelectedCanvasList();
  });

  /**
   * @listens selectAll
   * @description Update inputs on select all/deselect all press.
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
