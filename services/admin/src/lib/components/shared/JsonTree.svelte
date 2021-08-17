<script lang="ts">
  import IoMdArrowDropright from "svelte-icons/io/IoMdArrowDropright.svelte";
  import IoMdArrowDropdown from "svelte-icons/io/IoMdArrowDropdown.svelte";
  /**
   * @see https://svelte.dev/repl/347b37e18b5d4a65bbacfd097536db02?version=3.24.0
   */
  export let value: any;
  export let key = "";
  export let indent = 0;
  export let open = true;
  function toggleOpen() {
    open = !open;
  }
</script>

<div
  class="json-wrap auto-align auto-align__a-center auto-align__block auto-align__wrap"
  style="padding-left: {indent}rem"
>
  {#if key?.length}
    <span
      on:click={toggleOpen}
      class="expander auto-align auto-align__a-center"
    >
      {#if open}
        <span class="icon">
          <IoMdArrowDropdown />
        </span>
      {:else}
        <span class="icon">
          <IoMdArrowDropright />
        </span>
      {/if}
      <span class="key">{key}:</span>
    </span>
  {/if}
  {#if open}
    {#if typeof value === "object"}
      <br />
      {#if Array.isArray(value)}
        {#each value as item}
          {#if typeof item === "object"}
            <svelte:self
              key={Array.isArray(item) ? "array" : "object"}
              value={item}
              indent={indent + 1}
            />
          {:else}
            <svelte:self value={item} indent={indent + 1} />
          {/if}
        {/each}
      {:else}
        {#each Object.keys(value) as key}
          <svelte:self {key} value={value[key]} indent={indent + 1} />
        {/each}
      {/if}
    {:else}
      <span class={typeof value}>&nbsp;{value}</span>
    {/if}
  {/if}
</div>

<style>
  .json-wrap {
    width: 100%;
  }
  .expander {
    cursor: pointer;
    user-select: none;
  }
  :global(.json-wrap .string) {
    color: var(--secondary);
  }
  :global(.json-wrap .number) {
    color: black;
  }
  :global(.json-wrap .boolean) {
    color: purple;
  }
  :global(.json-wrap .null) {
    color: red;
  }
  :global(.json-wrap .key) {
    color: var(--primary);
  }
</style>
