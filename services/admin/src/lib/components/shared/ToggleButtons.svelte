<!--
@component
### Overview
This component lets the user toggle between two or more options (ex: daily, weekly, monthly)

### Properties
|    |    |    |
| -- | -- | -- |
| title : string    | optional | The title text to display in the toolbar |

### Usage
```  
<ToggleButtons
  activeIndex={lookupView === BY_SLUG_LABEL ? 0 : 1}
  color={lookupDone ? "secondary" : "primary"}
  options={[BY_SLUG_LABEL, BY_DATE_LABEL]}
  on:select={changeView}
/>
```
-->
<script lang="ts">
  import { createEventDispatcher } from "svelte";

  /**
   * @type {<EventKey extends string>(type: EventKey, detail?: any)} Triggers events that parent components can hook into.
   */
  const dispatch = createEventDispatcher();

  /**
   * @type {string} The label text of the toggle group to display.
   */
  export let label = "";

  /**
   * @type {string[]} The labels for each toggle button
   */
  export let options: string[] = [];

  /**
   * @type {number}
   */
  export let activeIndex: number = 0;

  /**
   * @type {"primary" or "secondary"} The labels for each toggle button
   */
  export let color: "primary" | "secondary" = "primary";

  /**
   * @function
   * When a toggle button is clicked, set the active button and alert any parents
   */
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
    color: var(--light-font);
  }
  .toggle-buttons div.secondary.active {
    border: 1px solid var(--secondary);
    background: var(--secondary-light);
    color: var(--light-font);
  }
  .toggle-buttons div:hover {
    filter: brightness(1.1);
  }
</style>
