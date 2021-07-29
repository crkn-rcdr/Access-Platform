<!--
@component
### Overview
A number input that automatically resizes based on its value.

### Properties
|    |    |    |
| -- | -- | -- |
| name : string                | required | The name HTML attribute associated with the number input |
| value: number or undefined   | required | The value of the number input |
| max: number                  | required | The maximum value of the number input |

### Usage
```  
<AutomaticResizeNumberInput
  name="numberInput"
  max={0}
  on:changed={(event) => {
    console.logs(event.detail)
  }}
  bind:value
/>
```
*Note: `bind:` is required for changes to the parameters to be reflected in higher level components.*
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import TiArrowSortedUp from "svelte-icons/ti/TiArrowSortedUp.svelte";
  import TiArrowSortedDown from "svelte-icons/ti/TiArrowSortedDown.svelte";

  /**
   * @type {string} The name HTML attribute associated with the number input.
   */
  export let name: string;

  /**
   * @type {number | undefined} The value of the number input.
   */
  export let value: number | undefined;

  /**
   * @type {number} The maximum value of the number input.
   */
  export let max: number;

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {HTMLInputElement} The html input element for the number.
   */
  let input: HTMLInputElement;

  /**
   * @type {number | undefined} The previous value of the number input before it was changed.
   */
  let prevValue: number | undefined;

  /**
   * Removes any non numeric characters from the @var value and resets the @var value to @var prevValue if the one entered is out of bounds
   * @returns
   */
  function sanitizeInput() {
    let valueInt = parseInt(`${value}`.replace(/\D/g, ""));
    if (!isNaN(valueInt)) {
      value = valueInt <= max && valueInt >= 0 ? valueInt : prevValue;
    }
  }

  /**
   * Decrements the value when the up arrow icon is pressed. Calls @function handleChange afterwards.
   * @returns void
   */
  function upArrowPressed() {
    if (typeof value === "number") {
      value--;
      handleChange();
    }
  }

  /**
   * Increments the value when the down arrow icon is pressed. Calls @function handleChange afterwards.
   * @returns void
   */
  function downArrowPressed() {
    if (typeof value === "number") {
      value++;
      handleChange();
    }
  }

  /**
   * Resizes the input based on the length of the value
   * @returns void
   */
  function resizeInput() {
    input.style.width = `${input.value.length}.9em`;
  }

  /**
   * Sends the @event changed to any parent components with the new value in the event.detail.
   * @returns void
   */
  function sendChangeEvent() {
    dispatch("changed", { value });
  }

  /**
   * Helper method to be called after any time the value is changed to @function sanitizeInput, @function resizeInput, and @function sendChangeEvent
   * @returns void
   */
  function handleChange() {
    sanitizeInput();
    resizeInput();
    sendChangeEvent();
  }

  /**
   * Calls @function sanizeInput and @function resizeInput upon user typing the value into the input
   * @returns void
   */
  function handleKeyup() {
    sanitizeInput();
    resizeInput();
  }

  /**
   * @event onMount
   * @description When the component instance is mounted onto the dom, @var prevValue is set to the @var value, and the size of the input is set by calling @function resizeInput.
   */
  onMount(() => {
    prevValue = value;
    resizeInput();
  });
</script>

<div class="auto-align auto-align__full auto-align auto-align__j-center">
  <input
    bind:this={input}
    bind:value
    {name}
    on:change={handleChange}
    on:keyup={handleKeyup}
  />

  <div
    class="auto-align auto-align__full auto-align auto-align__column auto-align auto-align__j-center auto-align auto-align__a-center"
  >
    <div class="action icon" on:click={upArrowPressed}>
      <TiArrowSortedUp />
    </div>
    <div class="action icon" on:click={downArrowPressed}>
      <TiArrowSortedDown />
    </div>
  </div>
</div>

<style>
  input {
    margin-top: 0;
    padding: 0.5rem !important;
  }
  .icon {
    opacity: 0.6;
    width: 1.25rem;
    height: 1.25rem;
  }
</style>
