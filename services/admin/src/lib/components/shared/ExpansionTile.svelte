<!--
@component
### Overview
A container that expands to show more content when the user clicks the expand icon.
### Properties
|    |    |    |
| -- | -- | -- |
| useInfoIcon : boolean    | optional | Allows for configuring the toggle icon for the detail section. If this is false, an upward facing carat will show. If it is true, and info icon will show. |

### Usage
```
<ExpansionTile useInfoIcon={true}>
  <div slot="top">
    ...Before the fold
  </div>
  <div slot="bottom">

    ...After the fold
  </div>
</ExpansionTile>
```
-->
<script lang="ts">
  import FaAngleDown from "svelte-icons/fa/FaAngleDown.svelte";
  import FaInfoCircle from "svelte-icons/fa/FaInfoCircle.svelte";
  import FaAngleUp from "svelte-icons/fa/FaAngleUp.svelte";

  /**
   * @type {boolean} Allows for configuring the toggle icon for the detail section. If this is false, an upward facing carat will show. If it is true, and info icon will show.
   */
  export let useInfoIcon = false;

  export let topClass = "";

  /**
   * @type {boolean} If the bottom section is toggled open or not.
   */
  export let toggled = false;
</script>

<div>
  <div class={topClass}>
    <slot name="top" />
    {#if !toggled}
      <div
        class="icon"
        on:click={() => {
          toggled = true;
        }}
      >
        {#if useInfoIcon}
          <FaInfoCircle />
        {:else}
          <FaAngleDown />
        {/if}
      </div>
    {:else}
      <div
        class="icon"
        on:click={() => {
          toggled = false;
        }}
      >
        <FaAngleUp />
      </div>
    {/if}
  </div>
  {#if toggled}
    <div>
      <slot name="bottom" />
    </div>
  {/if}
</div>

<style>
  .icon {
    float: right;
    margin: 0 0.5rem;
    cursor: pointer;
  }
</style>
