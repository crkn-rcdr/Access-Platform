<!--
@component
### Overview
The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions.

### Properties
|    |    |    |
| -- | -- | -- |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |
| prop : type    | [required, optional] |

### Usage
**Example one**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*

**Example two**
```  
<Editor bind:object />
```
*Note: `--capt-add=SYS-ADMIN` is required for PDF rendering.*
-->
<script lang="ts">
  import FaAngleDown from "svelte-icons/fa/FaAngleDown.svelte";
  import FaInfoCircle from "svelte-icons/fa/FaInfoCircle.svelte";
  import FaAngleUp from "svelte-icons/fa/FaAngleUp.svelte";

  /**
   * @type {string} Slug being resolved.
   */
  export let useInfoIcon = false;

  /**
   * @type {string} Slug being resolved.
   */
  let toggled = false;
</script>

<div>
  <div>
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
  }
</style>
