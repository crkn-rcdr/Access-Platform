<script>
  import { onMount } from "svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let name;
  export let value;
  export let min;
  export let max;

  let input;

  function resizeInput() {
    input.style.width = `${input.value.length}.9em`;
  }

  function changed(e) {
    dispatch("changed", { changeEvent: e, value: input.value });
  }

  onMount(() => {
    resizeInput();
    input.addEventListener("keyup", resizeInput);
    input.addEventListener("change", resizeInput);
  });
</script>

<input
  bind:this={input}
  type="number"
  {min}
  {max}
  {name}
  bind:value
  on:change={changed}
/>
