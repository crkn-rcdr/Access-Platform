<!--
@component
### Overview
This component holds the functionality for editing labels of canvases.

### Properties
|    |    |    |
| -- | -- | -- |
| label: string or undefined | required | The label to be edited for the canvas |

### Usage
```  
<CanvasLabelEditor
  bind:label={activeCanvas["label"]["none"]}
  on:changed={(event) => { console.logs(event.detail) } }
>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import { createEventDispatcher, tick } from "svelte";
  import ValueSaveForm from "../shared/ValueSaveForm.svelte";

  /**
   * @type {string} The label to be edited for the canvas
   */
  export let canvasID: string | undefined;

  /**
   * @type {string} The label to be edited for the canvas
   */
  export let label: string | undefined;

  let redraw: boolean = false;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * The method triggers a @event changed which outputs the new label of canvas in it's event.detail.
   * @returns void
   */
  function changed() {
    dispatch("changed", label);
  }

  $: {
    redraw = true;
    canvasID;
    tick().then(() => (redraw = false));
  }
</script>

{#if typeof label !== "undefined" && !redraw}
  <div id="label">
    <label for="canvasLabel">Canvas Label</label>
    <ValueSaveForm bind:value={label} on:save={changed}>
      <textarea rows="1" name="canvasLabel" bind:value={label} />
    </ValueSaveForm>
  </div>
  <slot />
{/if}

<style>
  #label {
    width: max(80%, 15rem);
    margin: auto;
    padding: 1.5rem 0;
  }

  textarea {
    width: 100%;
  }
</style>
