<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let label: string | undefined;

  const dispatch = createEventDispatcher();

  function changed() {
    dispatch("changed", label);
  }
</script>

{#if typeof label !== "undefined"}
  <div id="label">
    <label for="canvasLabel">Canvas Label</label>
    <textarea
      rows="1"
      name="canvasLabel"
      bind:value={label}
      on:keyup={changed}
    />
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
