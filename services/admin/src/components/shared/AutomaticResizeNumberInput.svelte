<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import TiArrowSortedUp from "svelte-icons/ti/TiArrowSortedUp.svelte";
  import TiArrowSortedDown from "svelte-icons/ti/TiArrowSortedDown.svelte";
  import Align from "./Align.svelte";

  export let name: string;
  export let value: number | undefined;
  export let max: number;

  const dispatch = createEventDispatcher();

  let input: HTMLInputElement;
  let prevValue: number | undefined;

  function sanitizeInput() {
    let valueInt = parseInt(`${value}`.replace(/\D/g, ""));
    if (!isNaN(valueInt)) {
      value = valueInt <= max && valueInt >= 0 ? valueInt : prevValue;
    }
  }

  function upArrowPressed() {
    if (typeof value === "number") {
      value--;
      handleChange();
    }
  }

  function downArrowPressed() {
    if (typeof value === "number") {
      value++;
      handleChange();
    }
  }

  function resizeInput() {
    input.style.width = `${input.value.length}.9em`;
  }

  function sendChangeEvent() {
    dispatch("changed", { value });
  }

  function handleChange() {
    sanitizeInput();
    resizeInput();
    sendChangeEvent();
  }

  function handleKeyup() {
    sanitizeInput();
    resizeInput();
  }

  onMount(() => {
    prevValue = value;
    resizeInput();
  });
</script>

<Align horizontal="center">
  <input
    bind:this={input}
    bind:value
    {name}
    on:change={handleChange}
    on:keyup={handleKeyup}
  />

  <Align direction="column" horizontal="center" vertical="center">
    <div class="action icon" on:click={upArrowPressed}>
      <TiArrowSortedUp />
    </div>
    <div class="action icon" on:click={downArrowPressed}>
      <TiArrowSortedDown />
    </div>
  </Align>
</Align>

<style>
  input {
    margin-top: 0;
  }
  .icon {
    opacity: 0.6;
    width: 18px;
    height: 18px;
  }
</style>
