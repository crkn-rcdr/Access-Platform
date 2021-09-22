<!--
@component
### Overview

### Properties
|    |    |    |
| -- | -- | -- |
| title : string    | optional | The title text to display in the toolbar |

### Usage
```  
```
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {string} The label text to display.
   */
  export let label = "";
  export let options: string[] = [];
  export let color: "primary" | "secondary" = "primary";

  let activeIndex: number = 0;

  function itemClicked(index: number, option: string) {
    activeIndex = index;
    dispatch("select", { index, option });
  }
</script>

{#if label.length}
  {label}<br />
{/if}
<div class="toggle-buttons auto-align">
  {#each options as option, i}
    <div
      class={`${color}`}
      class:active={i === activeIndex}
      on:click={() => itemClicked(i, option)}
    >
      {option}
    </div>
  {/each}
</div>

<style>
  .toggle-buttons {
    border-radius: var(--border-radius);
    overflow: hidden;
  }
  .toggle-buttons div {
    margin-right: 0px !important;
    margin-left: 0px !important;
    padding: var(--perfect-fourth-8) var(--perfect-fourth-4);
    display: inline;
    border: 1px solid var(--border-color);
    cursor: pointer;
    background: var(--light-bg);
  }
  .toggle-buttons div.primary.active {
    border: 1px solid var(--primary);
    background: var(--primary-light);
  }
  .toggle-buttons div.secondary.active {
    border: 1px solid var(--secondary);
    background: var(--secondary-light);
  }
  .toggle-buttons div:hover {
    filter: brightness(1.1);
  }
</style>
