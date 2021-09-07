<!--
@component
### Overview
This components recursively draws an object in a json viewer format.

### Properties
|    |    |    |
| -- | -- | -- |
| value: any | required | The value of the current JSON item being displayed |
| key: string | optional | The key of the current JSON item being displayed |
| indent: number | optional | The indentation in 'rem' to set for this key vakue pair. Determines the margin-left of the information in the interface. |
| open : boolean | optional | A state tracker for if the interface for this key value pair is expanded or not. |

### Usage
```
<JsonTree value={{ object: JSON.parse( A json string! ) }} />
```
-->
<script lang="ts">
  /**
   * @see https://svelte.dev/repl/347b37e18b5d4a65bbacfd097536db02?version=3.24.0
   */
  import IoMdArrowDropright from "svelte-icons/io/IoMdArrowDropright.svelte";
  import IoMdArrowDropdown from "svelte-icons/io/IoMdArrowDropdown.svelte";

  /**
   * @type { any } The value of the current JSON item being displayed
   */
  export let value: any;

  /**
   * @type { string } The key of the current JSON item being displayed
   */
  export let key: string = "";

  /**
   * @type { number } The indentation in 'rem' to set for this key vakue pair. Determines the margin-left of the information in the interface.
   */
  export let indent: number = 0;

  /**
   * @type { boolean } A state tracker for if the interface for this key value pair is expanded or not.
   */
  export let open: boolean = true;

  /**
   * Toggles the interface for the key-value pair.
   * @returns void
   */
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
      <code class="key">{key}:</code>
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
      <code class={typeof value}>&nbsp;{value}</code>
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
