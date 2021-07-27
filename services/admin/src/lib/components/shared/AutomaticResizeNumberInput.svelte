<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] | desc |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import TiArrowSortedUp from "svelte-icons/ti/TiArrowSortedUp.svelte";
  import TiArrowSortedDown from "svelte-icons/ti/TiArrowSortedDown.svelte";

  /**
   * @type {string} Slug being resolved.
   */
  export let name: string;

  /**
   * @type {string} Slug being resolved.
   */
  export let value: number | undefined;

  /**
   * @type {string} Slug being resolved.
   */
  export let max: number;

  /**
   * @type {string} Slug being resolved.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {string} Slug being resolved.
   */
  let input: HTMLInputElement;

  /**
   * @type {string} Slug being resolved.
   */
  let prevValue: number | undefined;

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function sanitizeInput() {
    let valueInt = parseInt(`${value}`.replace(/\D/g, ""));
    if (!isNaN(valueInt)) {
      value = valueInt <= max && valueInt >= 0 ? valueInt : prevValue;
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function upArrowPressed() {
    if (typeof value === "number") {
      value--;
      handleChange();
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function downArrowPressed() {
    if (typeof value === "number") {
      value++;
      handleChange();
    }
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function resizeInput() {
    input.style.width = `${input.value.length}.9em`;
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function sendChangeEvent() {
    dispatch("changed", { value });
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function handleChange() {
    sanitizeInput();
    resizeInput();
    sendChangeEvent();
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
   */
  function handleKeyup() {
    sanitizeInput();
    resizeInput();
  }

  /**
   *
   * @param arr
   * @param currentIndex
   * @param destinationIndex
   * @returns
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
