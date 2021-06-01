<script>
  import TiArrowSortedUp from "svelte-icons/ti/TiArrowSortedUp.svelte";
  import TiArrowSortedDown from "svelte-icons/ti/TiArrowSortedDown.svelte";
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";
  import Align from "./Align.svelte";

  const dispatch = createEventDispatcher();

  export let name;
  export let value;
  export let min;
  export let max;

  let input;

  function resizeInput() {
    input.style.width = `${input.value.length}em`;
  }

  function changed(e) {
    dispatch("changed", { changeEvent: e, value: parseInt(value) });
  }

  function upArrowPressed(e) {
    let newValueAsNumber = parseInt(value) - 1;
    if (newValueAsNumber >= min) {
      value = newValueAsNumber;
      changed(e);
    }
  }

  function downArrowPressed(e) {
    let newValueAsNumber = parseInt(value) + 1;
    if (newValueAsNumber <= max) {
      value = newValueAsNumber;
      changed(e);
    }
  }

  onMount(() => {
    resizeInput();
    input.addEventListener("keyup", resizeInput);
    input.addEventListener("change", resizeInput);
  });
</script>

<Align horizontal="center">
  <input
    bind:this={input}
    type="text"
    {min}
    {max}
    {name}
    bind:value
    on:change={changed}
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
